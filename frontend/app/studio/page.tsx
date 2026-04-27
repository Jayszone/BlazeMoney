"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loadCampaign, saveCampaign } from "../lib/store";
import type { Campaign, Script } from "../lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

const ANGLE_COLORS: Record<string, string> = {
  "Fee Shock":      "#FF2D55",
  "Cultural Story": "#8B5CF6",
  "Side-by-Side":   "#0EA5E9",
  "Tutorial":       "#059669",
  "Lifestyle":      "#DB2777",
  "FOMO":           "#D97706",
};

const VARIANT_COLORS = ["#FFE234", "#FF2D55", "#0A0A0A", "#8B5CF6", "#059669", "#DB2777"];
const VARIANT_TEXT   = ["#0A0A0A", "#fff",    "#FFE234", "#fff",    "#fff",    "#fff"   ];

const CORRIDOR_LABELS: Record<string, string> = {
  us_mexico:      "US → Mexico 🇲🇽",
  us_india:       "US → India 🇮🇳",
  us_philippines: "US → Philippines 🇵🇭",
  us_nigeria:     "US → Nigeria 🇳🇬",
  us_guatemala:   "US → Guatemala 🇬🇹",
  us_el_salvador: "US → El Salvador 🇸🇻",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function Section({ label, accent, children }: { label: string; accent?: boolean; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase",
        color: accent ? "#FF2D55" : "#999", margin: "0 0 8px 0",
      }}>{label}</p>
      {children}
    </div>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#F5F5F5", borderRadius: 8, padding: "5px 10px",
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ── Fee Banner ─────────────────────────────────────────────────────────────────

function FeeBanner({ fee_summary }: { fee_summary: Campaign["fee_summary"] }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: 0, border: "2px solid #0A0A0A", borderRadius: 16,
      overflow: "hidden", marginBottom: 36,
    }}>
      {[
        { label: "Blaze", value: fee_summary.blaze, sub: "⚡ flat fee, no markup", bg: "#FFE234", textColor: "#0A0A0A", subColor: "#0A0A0A" },
        { label: "Western Union", value: fee_summary.wu, sub: "8× more expensive", bg: "#0A0A0A", textColor: "#fff", subColor: "#FF2D55" },
        { label: "Remitly", value: fee_summary.remitly, sub: "still costs more", bg: "#F5F5F5", textColor: "#0A0A0A", subColor: "#888" },
        { label: "You save vs WU", value: fee_summary.savings_vs_wu, sub: "every transfer", bg: "#0A0A0A", textColor: "#FFE234", subColor: "#FFE23499" },
      ].map((item, i) => (
        <div key={i} style={{ background: item.bg, padding: "20px 22px", borderRight: i < 3 ? "2px solid #0A0A0A" : "none" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: item.textColor, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px 0", opacity: 0.7 }}>{item.label}</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: item.textColor, margin: "0 0 4px 0", letterSpacing: "-0.03em" }}>{item.value}</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: item.subColor, margin: 0 }}>{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Script Card ────────────────────────────────────────────────────────────────

function ScriptCard({
  script, index, campaignContext, corridor, onUpdate,
}: {
  script: Script;
  index: number;
  campaignContext: string;
  corridor: string;
  onUpdate: (s: Script) => void;
}) {
  const [refineMsg, setRefineMsg] = useState("");
  const [refining, setRefining] = useState(false);
  const [copied, setCopied] = useState(false);

  const accentColor = ANGLE_COLORS[script.angle] ?? "#0A0A0A";
  const variantColor = VARIANT_COLORS[index] ?? "#FFE234";
  const variantText  = VARIANT_TEXT[index]  ?? "#0A0A0A";

  async function handleRefine() {
    if (!refineMsg.trim()) return;
    setRefining(true);
    try {
      const resp = await fetch(`${API}/api/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, message: refineMsg, corridor, campaign_context: campaignContext }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      onUpdate(data.script);
      setRefineMsg("");
    } catch (e) {
      alert(`Refine failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setRefining(false);
    }
  }

  function copyScript() {
    navigator.clipboard.writeText(
      `HOOK:\n${script.hook}\n\nSCRIPT:\n${script.script}\n\nFEE CALLOUT:\n${script.fee_callout}\n\nCTA:\n${script.cta}\n\nCREATOR DIRECTION:\n${script.creator_direction}\n\n${script.hashtags.join(" ")}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      border: "2px solid #0A0A0A",
      borderRadius: 16,
      marginBottom: 20,
      overflow: "hidden",
      background: "#FFFFFF",
    }}>
      {/* Card header */}
      <div style={{
        background: "#0A0A0A",
        padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Variant badge */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: variantColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: variantText, flexShrink: 0,
          }}>
            {String.fromCharCode(65 + index)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>{script.title}</span>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                background: `${accentColor}22`, color: accentColor,
                border: `1px solid ${accentColor}44`,
                letterSpacing: "0.04em",
              }}>
                {script.angle}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#555", margin: 0, fontStyle: "italic" }}>
              &ldquo;{script.hook.slice(0, 90)}{script.hook.length > 90 ? "..." : ""}&rdquo;
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#555" }}>{script.estimated_duration}</span>
          <button
            onClick={copyScript}
            style={{
              background: copied ? "#FFE234" : "#1a1a1a",
              border: "none", borderRadius: 8,
              padding: "7px 14px", fontSize: 11, fontWeight: 800,
              color: copied ? "#0A0A0A" : "#888",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Card body — always expanded */}
      <div style={{ padding: "24px 24px 20px" }}>

        {/* Hook — big and bold */}
        <div style={{
          background: "#FAFAFA", border: "1px solid #F0F0F0",
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: 10, padding: "16px 18px", marginBottom: 20,
        }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Hook</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: "#0A0A0A", lineHeight: 1.4, margin: 0 }}>
            &ldquo;{script.hook}&rdquo;
          </p>
        </div>

        {/* Fee callout — yellow box */}
        <div style={{
          background: "#FFE234", border: "2px solid #0A0A0A",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💰</span>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, color: "#0A0A0A", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px 0" }}>Fee callout overlay</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: "#0A0A0A", margin: 0 }}>{script.fee_callout}</p>
          </div>
        </div>

        {/* Script */}
        <Section label="Script">
          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{script.script}</p>
        </Section>

        {/* Scene breakdown */}
        <Section label="Scene Breakdown">
          {script.scene_breakdown.map((scene, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < script.scene_breakdown.length - 1 ? 10 : 0 }}>
              <span style={{
                fontSize: 10, fontWeight: 900, color: "#0A0A0A",
                background: "#F5F5F5", border: "1px solid #E8E8E8",
                borderRadius: 6, padding: "2px 7px", flexShrink: 0, marginTop: 2,
                minWidth: 28, textAlign: "center",
              }}>S{i + 1}</span>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.55 }}>{scene}</p>
            </div>
          ))}
        </Section>

        {/* Creator direction */}
        <Section label="Creator Direction" accent>
          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.65, margin: 0 }}>{script.creator_direction}</p>
        </Section>

        {/* CTA */}
        <Section label="CTA">
          <p style={{ fontSize: 14, color: "#0A0A0A", fontWeight: 700, margin: 0 }}>{script.cta}</p>
        </Section>

        {/* Meta + hashtags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <Tag label="Duration" value={script.estimated_duration} />
          <Tag label="Emotion" value={script.emotion_trigger} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {script.hashtags.map(h => (
            <span key={h} style={{
              fontSize: 12, color: "#FF2D55", background: "#FFF0F3",
              border: "1px solid #FFD6DE", borderRadius: 99, padding: "3px 10px", fontWeight: 600,
            }}>{h}</span>
          ))}
        </div>

        {/* Refine */}
        <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px 0" }}>Refine this script</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={refineMsg}
              onChange={e => setRefineMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleRefine()}
              placeholder="e.g. make the hook more emotional, add a Diwali reference..."
              style={{
                flex: 1, background: "#FAFAFA", border: "1.5px solid #E8E8E8",
                borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#0A0A0A",
                outline: "none", fontFamily: "inherit",
              }}
            />
            <button
              onClick={handleRefine}
              disabled={refining || !refineMsg.trim()}
              style={{
                background: refining || !refineMsg.trim() ? "#F0F0F0" : "#0A0A0A",
                color: refining || !refineMsg.trim() ? "#bbb" : "#FFE234",
                border: "none", borderRadius: 8, padding: "10px 18px",
                fontSize: 13, fontWeight: 800,
                cursor: refining || !refineMsg.trim() ? "not-allowed" : "pointer",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              {refining ? "Refining..." : "Refine →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Experiment Plan ────────────────────────────────────────────────────────────

function ExperimentPlanSection({ plan, scripts }: { plan: Campaign["experiment_plan"]; scripts: Campaign["scripts"] }) {
  return (
    <div>
      {/* Explainer */}
      <div style={{
        background: "#0A0A0A", border: "2px solid #0A0A0A",
        borderRadius: 16, padding: "24px 28px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>🧪</span>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", margin: 0, letterSpacing: "-0.03em" }}>
              What is the A/B experiment?
            </h3>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: "0 0 16px 0" }}>
          Each creator brief you generated is a <span style={{ color: "#FFE234", fontWeight: 700 }}>separate variant</span> in an A/B experiment.
          You distribute each script to different creators, post them on the same platform,
          and measure which angle drives the most Blaze app installs. The winner gets scaled.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {scripts.map((s, i) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#1a1a1a", borderRadius: 8, padding: "7px 12px",
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: VARIANT_COLORS[i] ?? "#FFE234",
                color: VARIANT_TEXT[i] ?? "#0A0A0A",
                fontSize: 11, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{String.fromCharCode(65 + i)}</span>
              <span style={{ fontSize: 12, color: "#888" }}>Script {i + 1} · {s.angle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hypothesis */}
      <div style={{
        background: "#FFFBEB", border: "2px solid #FFE234",
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: "#D97706", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Hypothesis</p>
        <p style={{ fontSize: 14, color: "#0A0A0A", margin: 0, lineHeight: 1.65, fontWeight: 500 }}>{plan.hypothesis}</p>
      </div>

      {/* Variants — one per script */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(plan.variants.length, 3)}, 1fr)`, gap: 14, marginBottom: 20 }}>
        {plan.variants.map((v, i) => {
          const matchedScript = scripts.find(s => s.id === v.script_id) ?? scripts[i];
          const color = VARIANT_COLORS[i] ?? "#FFE234";
          const text  = VARIANT_TEXT[i]  ?? "#0A0A0A";
          return (
            <div key={v.label} style={{
              border: "2px solid #0A0A0A",
              borderTop: `5px solid ${color}`,
              borderRadius: 12, padding: "18px 18px",
              background: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: color, color: text,
                  fontSize: 13, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {v.label}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#0A0A0A", margin: 0 }}>Variant {v.label}</p>
                  <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{v.hook_type}</p>
                </div>
              </div>
              {matchedScript && (
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px 0", fontStyle: "italic" }}>
                  &ldquo;{matchedScript.hook.slice(0, 70)}...&rdquo;
                </p>
              )}
              <p style={{ fontSize: 12, color: "#444", lineHeight: 1.55, margin: "0 0 8px 0" }}>{v.why}</p>
              <p style={{ fontSize: 11, color: "#FF2D55", fontWeight: 700, margin: 0 }}>Target: {v.target}</p>
            </div>
          );
        })}
      </div>

      {/* Metrics + timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ border: "2px solid #0A0A0A", borderRadius: 12, padding: "18px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Primary metric</p>
          <p style={{ fontSize: 14, color: "#0A0A0A", fontWeight: 800, margin: "0 0 12px 0" }}>{plan.primary_metric}</p>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Winning signal</p>
          <p style={{ fontSize: 13, color: "#059669", fontWeight: 800, margin: 0 }}>{plan.winning_signal}</p>
        </div>
        <div style={{ border: "2px solid #0A0A0A", borderRadius: 12, padding: "18px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Posting cadence</p>
          <p style={{ fontSize: 13, color: "#444", margin: "0 0 12px 0", lineHeight: 1.5 }}>{plan.posting_cadence}</p>
          {plan.secondary_metrics?.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Also tracking</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {plan.secondary_metrics.map(m => (
                  <span key={m} style={{ fontSize: 11, color: "#555", background: "#F5F5F5", border: "1px solid #E8E8E8", borderRadius: 99, padding: "3px 10px" }}>{m}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ border: "2px solid #0A0A0A", borderRadius: 12, padding: "18px 20px", background: "#FAFAFA" }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Experiment timeline</p>
        <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7, margin: 0 }}>{plan.timeline}</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [tab, setTab] = useState<"scripts" | "experiment">("scripts");

  useEffect(() => {
    const c = loadCampaign();
    if (!c) { router.replace("/"); return; }
    setCampaign(c);
  }, [router]);

  if (!campaign) return null;

  const corridor = campaign.brief_input?.corridor ?? "";
  const corridorLabel = CORRIDOR_LABELS[corridor] ?? corridor;
  const platform = campaign.brief_input?.platform?.replace(/_/g, " ") ?? "";
  const campaignContext = `${campaign.campaign_name} — ${campaign.corridor_insight}`;

  function updateScript(updated: Script) {
    setCampaign(prev => {
      if (!prev) return prev;
      const next = { ...prev, scripts: prev.scripts.map(s => s.id === updated.id ? updated : s) };
      saveCampaign(next);
      return next;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0A0A0A" }}>

      {/* Header */}
      <header style={{
        borderBottom: "2px solid #0A0A0A",
        padding: "0 40px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#FFFFFF", zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#FFE234", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.04em" }}>Blaze</span>
          </div>
          <span style={{ color: "#E8E8E8" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#888" }}>{corridorLabel}</span>
          {platform && (
            <span style={{ fontSize: 11, background: "#FF2D55", color: "#fff", padding: "2px 9px", borderRadius: 99, fontWeight: 700 }}>
              {platform}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none", border: "2px solid #E8E8E8", borderRadius: 8,
            padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#888",
            cursor: "pointer",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#0A0A0A")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#E8E8E8")}
        >
          ← New brief
        </button>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "44px 40px 80px" }}>

        {/* Campaign header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            {campaign.scripts.length} creator briefs · {campaign.scripts.length} A/B variants
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.04em", margin: "0 0 14px 0", lineHeight: 1.1 }}>
            {campaign.campaign_name}
          </h1>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
            {campaign.corridor_insight}
          </p>
        </div>

        {/* Fee banner */}
        <FeeBanner fee_summary={campaign.fee_summary} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #0A0A0A" }}>
          {(["scripts", "experiment"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#0A0A0A" : "none",
                border: "none", cursor: "pointer",
                padding: "11px 20px", fontSize: 13, fontWeight: 800,
                color: tab === t ? "#FFE234" : "#888",
                marginBottom: -2,
                borderRadius: tab === t ? "8px 8px 0 0" : 0,
                transition: "all 0.15s",
                letterSpacing: "-0.01em",
              }}
            >
              {t === "scripts"
                ? `Creator Briefs (${campaign.scripts.length})`
                : `A/B Experiment (${campaign.experiment_plan?.variants?.length ?? 0} variants)`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "scripts" && campaign.scripts.map((script, i) => (
          <ScriptCard
            key={script.id}
            script={script}
            index={i}
            campaignContext={campaignContext}
            corridor={corridor}
            onUpdate={updateScript}
          />
        ))}

        {tab === "experiment" && (
          <ExperimentPlanSection plan={campaign.experiment_plan} scripts={campaign.scripts} />
        )}
      </div>
    </div>
  );
}
