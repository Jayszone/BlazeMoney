"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveCampaign, saveBriefInput } from "../lib/store";
import type { Campaign } from "../lib/types";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003").replace(/\/$/, "");
const SCRIPT_COUNTS = [2, 3, 4, 5, 6];

const LOADING_MSGS = [
  "Analyzing payment corridor...",
  "Loading real fee data...",
  "Building audience insight...",
  "Writing corridor-specific hooks...",
  "Adding fee comparison callouts...",
  "Designing A/B experiment plan...",
  "Finalizing your creator briefs...",
];

// ── Step config ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "step1",
    title: "Who are you targeting?",
    subtitle: "Scripts are built around real cultural moments for each corridor and audience.",
    fields: [
      {
        id: "corridor",
        label: "Payment corridor",
        cols: 3,
        options: [
          { label: "🇺🇸 → 🇲🇽  US → Mexico", value: "us_mexico" },
          { label: "🇺🇸 → 🇮🇳  US → India", value: "us_india" },
          { label: "🇺🇸 → 🇵🇭  US → Philippines", value: "us_philippines" },
          { label: "🇺🇸 → 🇳🇬  US → Nigeria", value: "us_nigeria" },
          { label: "🇺🇸 → 🇬🇹  US → Guatemala", value: "us_guatemala" },
          { label: "🇺🇸 → 🇸🇻  US → El Salvador", value: "us_el_salvador" },
        ],
      },
      {
        id: "audience",
        label: "Target audience",
        cols: 3,
        options: [
          { label: "👨‍👩‍👧  First-gen immigrants", value: "first_gen_immigrants" },
          { label: "🎓  College students sending home", value: "college_students" },
          { label: "🚗  Gig workers & hourly earners", value: "gig_workers" },
          { label: "💼  Small business owners", value: "small_biz_owners" },
          { label: "👶  New parents supporting family", value: "new_parents" },
          { label: "👩‍💻  Young professionals (25–35)", value: "young_professionals" },
        ],
      },
    ],
  },
  {
    id: "step2",
    title: "Content style & message",
    subtitle: "Define the tone creators should use and the core angle that drives action.",
    fields: [
      {
        id: "content_style",
        label: "Content style & tone",
        cols: 3,
        options: [
          { label: "🎭  Raw & authentic", value: "raw_authentic" },
          { label: "✨  Polished & aspirational", value: "polished_aspirational" },
          { label: "😂  Humor & entertainment", value: "humor_entertainment" },
          { label: "💔  Emotional & heartfelt", value: "emotional_heartfelt" },
          { label: "📚  Educational & informative", value: "educational" },
          { label: "🔥  Bold & controversial", value: "bold_controversial" },
        ],
      },
      {
        id: "message_angle",
        label: "Core message angle",
        cols: 3,
        options: [
          { label: "💸  Fee savings", value: "fee_savings" },
          { label: "⚡  Speed & instant transfer", value: "speed" },
          { label: "🤝  Trust & reliability", value: "trust" },
          { label: "👨‍👩‍👧  Family connection", value: "family_connection" },
          { label: "🌍  Cultural pride", value: "cultural_pride" },
          { label: "💪  Financial empowerment", value: "financial_empowerment" },
        ],
      },
    ],
  },
  {
    id: "step3",
    title: "Platform & campaign goals",
    subtitle: "Where are these going and what does success look like?",
    fields: [
      {
        id: "platform",
        label: "Platform",
        cols: 2,
        options: [
          { label: "TikTok", value: "tiktok" },
          { label: "Instagram Reels", value: "instagram_reels" },
          { label: "YouTube Shorts", value: "youtube_shorts" },
          { label: "LinkedIn", value: "linkedin" },
        ],
      },
      {
        id: "campaign_goal",
        label: "Primary campaign goal",
        cols: 2,
        options: [
          { label: "📲  App installs", value: "app_installs" },
          { label: "👁️  Brand awareness", value: "brand_awareness" },
          { label: "🔗  Link clicks & traffic", value: "link_clicks" },
          { label: "🌊  Viral reach", value: "viral_reach" },
          { label: "💬  Community engagement", value: "community_engagement" },
          { label: "🔄  Sign-ups & conversion", value: "conversion" },
        ],
      },
    ],
  },
];

// ── Option button ──────────────────────────────────────────────────────────────

function OptionBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? "#FFE234" : hovered ? "#FAFAFA" : "#FFFFFF",
        border: `1.5px solid ${selected ? "#E0B800" : hovered ? "#D0D0D0" : "#EBEBEB"}`,
        borderRadius: 10,
        padding: "13px 16px",
        textAlign: "left",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: selected ? 800 : 500,
        color: selected ? "#0A0A0A" : hovered ? "#0A0A0A" : "#777",
        transition: "all 0.12s",
        outline: "none",
        width: "100%",
        boxShadow: selected ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
      }}
    >
      {label}
    </button>
  );
}

// ── Generating screen ──────────────────────────────────────────────────────────

function GeneratingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, LOADING_MSGS.length - 1)), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#FFE234", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.04em" }}>Blaze</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px 0" }}>Generating</p>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.04em", margin: 0 }}>Building your creator briefs...</h2>
      </div>
      <div style={{ width: 36, height: 36, border: "3px solid #F0F0F0", borderTop: "3px solid #FFE234", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: 40 }} />
      <div style={{ maxWidth: 380, width: "100%", background: "#FAFAFA", border: "1px solid #EBEBEB", borderRadius: 14, padding: "20px 24px" }}>
        {LOADING_MSGS.map((msg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", opacity: i > idx ? 0.2 : 1, transition: "opacity 0.3s" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, flexShrink: 0, transition: "background 0.3s",
              background: i < idx ? "#0A0A0A" : i === idx ? "#FFE234" : "#EBEBEB",
              color: i < idx ? "#FFE234" : "#0A0A0A",
            }}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 13, color: i === idx ? "#0A0A0A" : "#bbb", fontWeight: i === idx ? 700 : 400 }}>{msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main wizard ────────────────────────────────────────────────────────────────

export default function BuildPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scriptCount, setScriptCount] = useState(3);
  const [generating, setGenerating] = useState(false);

  if (generating) return <GeneratingScreen />;

  const total = STEPS.length;
  const cur = STEPS[step];
  const isLast = step === total - 1;
  const stepOk = cur.fields.every(f => answers[f.id] !== undefined);

  async function handleGenerate() {
    setGenerating(true);
    const briefInput = {
      corridor: answers.corridor,
      audience: answers.audience,
      content_style: answers.content_style,
      message_angle: answers.message_angle,
      platform: answers.platform,
      campaign_goal: answers.campaign_goal,
      script_count: scriptCount,
    };
    saveBriefInput(briefInput);
    try {
      const resp = await fetch(`${API}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefInput),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
        throw new Error(e?.detail ?? `HTTP ${resp.status}`);
      }
      const data: Campaign = await resp.json();
      saveCampaign({ ...data, brief_input: briefInput });
      router.push("/studio");
    } catch (e) {
      setGenerating(false);
      alert(`Generation failed.\n\n${e instanceof Error ? e.message : e}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0A0A0A" }}>

      {/* Header */}
      <header style={{
        padding: "0 56px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #F0F0F0",
        position: "sticky", top: 0, background: "#FFFFFF", zIndex: 10,
      }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FFE234", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.04em", color: "#0A0A0A" }}>Blaze</span>
        </button>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 99,
                background: i < step ? "#0A0A0A" : i === step ? "#FFE234" : "#F5F5F5",
                border: `2px solid ${i <= step ? "#0A0A0A" : "#EBEBEB"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900,
                color: i < step ? "#FFE234" : "#0A0A0A",
                transition: "all 0.2s",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < total - 1 && (
                <div style={{ width: 36, height: 2, background: i < step ? "#0A0A0A" : "#EBEBEB", transition: "background 0.2s" }} />
              )}
            </div>
          ))}
        </div>

        <span style={{ fontSize: 12, color: "#bbb", fontWeight: 700, minWidth: 60, textAlign: "right" }}>
          {step + 1} of {total}
        </span>
      </header>

      {/* Step content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 56px 140px" }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px 0" }}>
          Step {step + 1} of {total}
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>
          {cur.title}
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 52px 0" }}>{cur.subtitle}</p>

        {cur.fields.map((field, fi) => (
          <div key={field.id} style={{ marginBottom: fi < cur.fields.length - 1 ? 52 : 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#0A0A0A", margin: "0 0 14px 0" }}>{field.label}</p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${field.cols}, 1fr)`, gap: 10 }}>
              {field.options.map(opt => (
                <OptionBtn
                  key={opt.value}
                  label={opt.label}
                  selected={answers[field.id] === opt.value}
                  onClick={() => setAnswers(p => ({ ...p, [field.id]: opt.value }))}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Script count — step 3 only */}
        {isLast && (
          <div style={{ marginTop: 52, paddingTop: 48, borderTop: "1px solid #F0F0F0" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#0A0A0A", margin: "0 0 4px 0" }}>How many creator briefs?</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 18px 0" }}>Each brief is a separate A/B variant — more briefs means a bigger experiment.</p>
            <div style={{ display: "flex", gap: 10 }}>
              {SCRIPT_COUNTS.map(n => {
                const sel = scriptCount === n;
                return (
                  <button
                    key={n}
                    onClick={() => setScriptCount(n)}
                    style={{
                      width: 54, height: 54, borderRadius: 10,
                      border: `1.5px solid ${sel ? "#E0B800" : "#EBEBEB"}`,
                      background: sel ? "#FFE234" : "#FFFFFF",
                      color: "#0A0A0A",
                      fontSize: 17, fontWeight: 900,
                      cursor: "pointer", transition: "all 0.12s", outline: "none",
                      boxShadow: sel ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: "#FF2D55", fontWeight: 700, margin: "10px 0 0 0" }}>
              {scriptCount} briefs = {scriptCount} A/B variants
            </p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#FFFFFF", borderTop: "1px solid #F0F0F0",
        padding: "16px 56px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/")}
          style={{
            background: "none", border: "1.5px solid #EBEBEB", borderRadius: 10,
            padding: "11px 22px", fontSize: 13, fontWeight: 700, color: "#888",
            cursor: "pointer", transition: "all 0.12s", outline: "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0A0A0A"; e.currentTarget.style.color = "#0A0A0A"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#EBEBEB"; e.currentTarget.style.color = "#888"; }}
        >
          ← {step > 0 ? "Back" : "Home"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!stepOk && (
            <p style={{ fontSize: 12, color: "#ccc", margin: 0, fontWeight: 600 }}>Make a selection to continue</p>
          )}
          <button
            onClick={() => isLast ? handleGenerate() : (setStep(s => s + 1), window.scrollTo({ top: 0, behavior: "smooth" }))}
            disabled={!stepOk}
            style={{
              background: stepOk ? "#0A0A0A" : "#F5F5F5",
              color: stepOk ? "#FFE234" : "#ccc",
              border: "none", borderRadius: 10,
              padding: "13px 32px", fontSize: 14, fontWeight: 900,
              cursor: stepOk ? "pointer" : "not-allowed",
              letterSpacing: "-0.01em", transition: "all 0.12s",
              boxShadow: stepOk ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {isLast ? `Generate ${scriptCount} briefs →` : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
