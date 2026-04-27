import os
import re
import json
import logging
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
logger = logging.getLogger(__name__)

OPENROUTER_KEYS = [k for k in [
    os.getenv("OPENROUTER_API_KEY_1"),
    os.getenv("OPENROUTER_API_KEY_2"),
    os.getenv("OPENROUTER_API_KEY_3"),
] if k]

_k1 = OPENROUTER_KEYS[0] if OPENROUTER_KEYS else None
_k2 = OPENROUTER_KEYS[1] if len(OPENROUTER_KEYS) > 1 else None
_k3 = OPENROUTER_KEYS[2] if len(OPENROUTER_KEYS) > 2 else None

OPENROUTER_FALLBACKS = [
    (_k1, "meta-llama/llama-3.3-70b-instruct:free"),
    (_k2, "meta-llama/llama-3.3-70b-instruct:free"),
    (_k1, "nousresearch/hermes-3-llama-3.1-405b:free"),
    (_k2, "qwen/qwen3-next-80b-a3b-instruct:free"),
    (_k3, "inclusionai/ling-2.6-flash:free"),
]

router = APIRouter()

# ── Corridor data ──────────────────────────────────────────────────────────────

CORRIDORS = {
    "us_mexico": {
        "label": "US → Mexico",
        "blaze_pct": 0.5,
        "wu_pct": 4.0,
        "remitly_pct": 2.9,
        "avg_send": 500,
        "cultural": [
            "quinceañera contributions", "Día de los Muertos expenses",
            "back-to-school (agosto)", "Fiestas Patrias (September 16)",
            "Mother's Day (May 10)", "paying rent in Mexico City",
            "abuela's medical bills", "Christmas posadas",
        ],
        "pain": "paying WU $20 on every $500 sent — that's a week of groceries for your family back home",
    },
    "us_india": {
        "label": "US → India",
        "blaze_pct": 0.5,
        "wu_pct": 4.0,
        "remitly_pct": 1.5,
        "avg_send": 500,
        "cultural": [
            "Diwali gifts and sweets", "wedding season (Nov–Feb)",
            "school fees and tuition", "supporting parents' retirement",
            "Raksha Bandhan", "Puja preparations",
            "medical emergencies", "property down payments",
        ],
        "pain": "SWIFT fees + WU markups eating 4-5% of every transfer — ₹1,680 gone on a ₹42,000 send",
    },
    "us_philippines": {
        "label": "US → Philippines",
        "blaze_pct": 0.5,
        "wu_pct": 4.0,
        "remitly_pct": 1.99,
        "avg_send": 500,
        "cultural": [
            "OFW balikbayan culture", "Christmas season (September)",
            "fiesta contributions", "college tuition",
            "supporting entire extended family", "All Saints' Day",
            "Typhoon relief remittances",
        ],
        "pain": "OFW workers sending $500/month losing $20 to WU fees — that's a month of your family's electric bill",
    },
    "us_nigeria": {
        "label": "US → Nigeria",
        "blaze_pct": 0.5,
        "wu_pct": 4.0,
        "remitly_pct": 2.99,
        "avg_send": 500,
        "cultural": [
            "Eid al-Fitr and Eid al-Adha", "Christmas and New Year (December)",
            "JAMB/WAEC school fees", "naira exchange rate volatility",
            "parents' monthly upkeep", "owambe celebrations",
        ],
        "pain": "WU's naira rate is 10–15% below market on top of the 4% fee — you're losing twice",
    },
    "us_guatemala": {
        "label": "US → Guatemala",
        "blaze_pct": 0.5,
        "wu_pct": 4.0,
        "remitly_pct": 2.9,
        "avg_send": 300,
        "cultural": [
            "Semana Santa expenses", "January school year start",
            "Day of the Dead altar costs", "Independence Day (September 15)",
            "Christmas pastorelas", "family medical emergencies",
        ],
        "pain": "construction workers sending $300 biweekly lose $12 each time — $312/year in WU fees alone",
    },
    "us_el_salvador": {
        "label": "US → El Salvador",
        "blaze_pct": 0.5,
        "wu_pct": 4.0,
        "remitly_pct": 2.9,
        "avg_send": 300,
        "cultural": [
            "Fiestas Agostinas (August)", "January school fees",
            "Independence Day (September 15)", "medical expenses",
            "pupusas and family gatherings", "home construction support",
        ],
        "pain": "remittances make up 26% of El Salvador's GDP — every dollar your family gets matters, not WU's cut",
    },
}


# ── LLM helpers ───────────────────────────────────────────────────────────────

def openrouter_complete(prompt: str, max_tokens: int = 4000) -> str:
    last_err = None
    for api_key, model in OPENROUTER_FALLBACKS:
        if not api_key:
            continue
        try:
            resp = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.8,
                    "max_tokens": max_tokens,
                },
                timeout=60,
            )
            if resp.status_code == 429:
                last_err = Exception(f"429 rate-limited: {model}")
                continue
            resp.raise_for_status()
            data = resp.json()
            if "error" in data:
                raise Exception(data["error"].get("message", str(data["error"])))
            content = data["choices"][0]["message"]["content"]
            logger.info(f"[OpenRouter] succeeded model={model}")
            return content
        except Exception as e:
            logger.warning(f"[OpenRouter] model={model} failed: {e}")
            last_err = e
    raise RuntimeError(f"All OpenRouter fallbacks exhausted. Last: {last_err}")


def call_groq_json(prompt: str, max_tokens: int = 4000, temperature: float = 0.7) -> str:
    resp = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content or "{}"


def llm_complete(prompt: str, max_tokens: int = 4000, temperature: float = 0.7) -> str:
    try:
        return call_groq_json(prompt, max_tokens, temperature)
    except Exception as e:
        if "rate_limit" in str(e).lower() or "429" in str(e):
            logger.warning("Groq rate-limited, falling back to OpenRouter")
            return openrouter_complete(prompt, max_tokens)
        raise


# ── Request models ─────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    corridor: str
    audience: str
    content_style: str
    message_angle: str
    platform: str
    campaign_goal: str
    script_count: int = 3


class RefineRequest(BaseModel):
    script: dict
    message: str
    corridor: str = ""
    campaign_context: str = ""


# ── Prompt builder ─────────────────────────────────────────────────────────────

def build_blaze_prompt(corridor_key: str, audience: str, content_style: str, message_angle: str, platform: str, campaign_goal: str, num_scripts: int) -> str:
    c = CORRIDORS.get(corridor_key, CORRIDORS["us_mexico"])

    send = c["avg_send"]
    blaze_fee  = round(send * c["blaze_pct"]  / 100, 2)
    wu_fee     = round(send * c["wu_pct"]     / 100, 2)
    remitly_fee = round(send * c["remitly_pct"] / 100, 2)
    save_wu    = round(wu_fee - blaze_fee, 2)
    save_rem   = round(remitly_fee - blaze_fee, 2)

    cultural = ", ".join(c["cultural"][:6])

    return f"""You are a UGC campaign strategist for fintech and remittance brands.

PRODUCT: Blaze — international money transfers at a flat {c["blaze_pct"]}% fee. No hidden exchange rate markup. Instant transfers.
CORRIDOR: {c["label"]}
AUDIENCE: {audience.replace("_", " ")}
CONTENT STYLE & TONE: {content_style.replace("_", " ")}
CORE MESSAGE ANGLE: {message_angle.replace("_", " ")}
PLATFORM: {platform.replace("_", " ")} — vertical video, hook-first, platform-native
PRIMARY CAMPAIGN GOAL: {campaign_goal.replace("_", " ")}

EXACT FEE DATA — use specific numbers in every script, no vague "save money":
  Blaze:    {c["blaze_pct"]}%  = ${blaze_fee:.2f} on a ${send} transfer
  Western Union: {c["wu_pct"]}%  = ${wu_fee:.2f} on a ${send} transfer
  Remitly:  {c["remitly_pct"]}%  = ${remitly_fee:.2f} on a ${send} transfer
  You save: ${save_wu:.2f} vs WU   |   ${save_rem:.2f} vs Remitly   on every ${send} sent

CORRIDOR PAIN POINT: {c["pain"]}

CULTURAL CONTEXT — weave specific moments into hooks and scripts:
{cultural}

SCRIPT REQUIREMENTS:
1. Every hook uses EXACT dollar amounts from the fee data above — no vague phrasing
2. Each script sounds like a REAL PERSON in this community talking to their phone — not a brand ad
3. Each script takes a DISTINCT angle (Fee Shock, Cultural Story, Side-by-Side, Tutorial, Lifestyle, FOMO)
4. "fee_callout" is a specific on-screen text overlay to show at the savings moment
5. Scene breakdowns are FILMABLE — specific locations, what to show on the phone screen, props
6. Creator direction is specific: exact setting, tone, energy, delivery speed

Generate exactly {num_scripts} creator briefs.

Return ONLY valid JSON:
{{
  "campaign_name": "<specific, memorable {c["label"]} campaign name>",
  "corridor_insight": "<2 sentences: psychological insight about this audience's relationship with sending money home and why Blaze's fee transparency hits differently>",
  "fee_summary": {{
    "blaze": "{c["blaze_pct"]}% = ${blaze_fee:.2f} on ${send}",
    "wu": "{c["wu_pct"]}% = ${wu_fee:.2f} on ${send}",
    "remitly": "{c["remitly_pct"]}% = ${remitly_fee:.2f} on ${send}",
    "savings_vs_wu": "${save_wu:.2f} per ${send}",
    "savings_vs_remitly": "${save_rem:.2f} per ${send}"
  }},
  "scripts": [
    {{
      "id": 1,
      "title": "<specific descriptive title>",
      "angle": "<Fee Shock|Cultural Story|Side-by-Side|Tutorial|Lifestyle|FOMO>",
      "hook": "<exact opening line — must include a specific dollar amount>",
      "script": "<full first-person script, 45–75 seconds spoken, real creator voice>",
      "scene_breakdown": ["<specific filmable scene 1>", "<scene 2>", "<scene 3>", "<scene 4>"],
      "fee_callout": "<exact text overlay — e.g. 'Blaze: $2.50. Western Union: $20.00. You just kept $17.50.'>",
      "cta": "<natural, non-salesy call to action>",
      "creator_direction": "<exact setting, lighting, what to show on phone screen, energy, pacing>",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "estimated_duration": "<e.g. 45–55 seconds>",
      "emotion_trigger": "<fear|curiosity|relatability|aspiration|humor>"
    }}
  ],
  "experiment_plan": {{
    "hypothesis": "<specific testable hypothesis about which of the {num_scripts} scripts best achieves '{campaign_goal.replace("_", " ")}' from the {audience.replace("_", " ")} segment on {platform.replace("_", " ")}, given the {content_style.replace("_", " ")} tone and {message_angle.replace("_", " ")} angle>",
    "variants": [
{chr(10).join([f'      {{"label": "{chr(65+i)}", "script_id": {i+1}, "hook_type": "<angle of script {i+1}>", "why": "<1 sentence: why this angle resonates with this specific audience>", "target": "<specific sub-segment of {audience.replace("_", " ")}>"}}{("," if i < num_scripts-1 else "")}' for i in range(num_scripts)])}
    ],
    "primary_metric": "<single most important metric directly tied to '{campaign_goal.replace("_", " ")}' — be specific, e.g. link-in-bio click rate, profile visits, save rate>",
    "secondary_metrics": ["<metric 1>", "<metric 2>", "<metric 3>"],
    "winning_signal": "<specific threshold — e.g. >2.5% link-in-bio click rate within 72 hours>",
    "posting_cadence": "<specific: days of week, times, frequency>",
    "timeline": "<week-by-week plan: when to post each variant, when to read results, when to scale winner — exactly {num_scripts} variants>"
  }}
}}

Each script must feel written by a real {audience.replace("_", " ")} who genuinely uses Blaze — not a Blaze marketing employee."""


# ── POST /generate ─────────────────────────────────────────────────────────────

@router.post("/generate")
def generate_briefs(req: GenerateRequest):
    prompt = build_blaze_prompt(
        req.corridor, req.audience, req.content_style, req.message_angle,
        req.platform, req.campaign_goal, req.script_count
    )
    try:
        content = llm_complete(prompt, max_tokens=4000, temperature=0.8)
        data = json.loads(content)
        if "scripts" not in data:
            raise ValueError("Incomplete response — missing scripts")
        return data
    except Exception as e:
        logger.error(f"[Generate] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /refine ───────────────────────────────────────────────────────────────

@router.post("/refine")
def refine_script(req: RefineRequest):
    corridor_label = CORRIDORS.get(req.corridor, {}).get("label", "international transfer")
    s = req.script

    prompt = f"""You are a UGC script editor for Blaze, a {corridor_label} money transfer app.

CURRENT SCRIPT:
Title: {s.get("title")}
Angle: {s.get("angle")}
Hook: {s.get("hook")}
Script: {s.get("script")}
Scene Breakdown: {json.dumps(s.get("scene_breakdown", []))}
Fee Callout: {s.get("fee_callout")}
CTA: {s.get("cta")}
Creator Direction: {s.get("creator_direction")}
Hashtags: {json.dumps(s.get("hashtags", []))}
Duration: {s.get("estimated_duration")}
Emotion: {s.get("emotion_trigger")}

Campaign context: {req.campaign_context}

USER FEEDBACK: "{req.message}"

Refine this script based on the feedback. Keep what's working. Only change what the feedback targets.
IMPORTANT: Keep all specific dollar amounts and fee comparisons accurate.

Return ONLY valid JSON with EXACTLY these fields:
{{
  "id": {s.get("id", 1)},
  "title": "...",
  "angle": "...",
  "hook": "...",
  "script": "...",
  "scene_breakdown": ["...", "...", "...", "..."],
  "fee_callout": "...",
  "cta": "...",
  "creator_direction": "...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "estimated_duration": "...",
  "emotion_trigger": "..."
}}"""

    try:
        data = json.loads(llm_complete(prompt, max_tokens=1500, temperature=0.7))
        if "hook" not in data:
            raise ValueError("Invalid refined script response")
        return {"script": data}
    except Exception as e:
        logger.error(f"[Refine] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
