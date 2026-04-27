"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0A0A0A" }}>

      {/* Nav */}
      <nav style={{
        padding: "0 56px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #F0F0F0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "#FFE234",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚡</div>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.04em" }}>Blaze</span>
          <span style={{ fontSize: 11, color: "#bbb", fontWeight: 600, background: "#F5F5F5", padding: "2px 8px", borderRadius: 99, marginLeft: 4 }}>UGC</span>
        </div>
        {/* TikTok pink badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#FF2D55", borderRadius: 99, padding: "5px 14px",
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>TikTok · Reels · Shorts</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 56px 0" }}>
        <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>

          {/* Left — copy */}
          <div style={{ flex: 1, maxWidth: 580 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#FFFAEB", border: "1px solid #FFE234",
              borderRadius: 99, padding: "5px 14px", marginBottom: 28,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFE234", display: "block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#B45309" }}>Built for Blaze&apos;s growth team</span>
            </div>

            <h1 style={{
              fontSize: 58, fontWeight: 900, letterSpacing: "-0.05em",
              lineHeight: 1.05, margin: "0 0 24px 0",
            }}>
              Creator briefs.<br />
              Built for every<br />
              <span style={{
                background: "#FFE234",
                padding: "0 8px",
                display: "inline-block",
                transform: "skewX(-2deg)",
              }}>corridor.</span>
            </h1>

            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7, margin: "0 0 40px 0", maxWidth: 480 }}>
              Blaze moves money at <strong style={{ color: "#0A0A0A" }}>0.5% flat</strong> — 8× cheaper than Western Union.
              This tool generates TikTok and Reels creator briefs with corridor-specific hooks,
              exact fee comparisons, and a full A/B experiment plan. In 30 seconds.
            </p>

            <button
              onClick={() => router.push("/build")}
              style={{
                background: "#0A0A0A", color: "#FFE234",
                border: "none", borderRadius: 12,
                padding: "17px 36px", fontSize: 16, fontWeight: 900,
                cursor: "pointer", letterSpacing: "-0.02em",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                transition: "transform 0.15s, box-shadow 0.15s",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.22)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
              }}
            >
              Start creating scripts
              <span style={{ fontSize: 18 }}>→</span>
            </button>

            <p style={{ fontSize: 12, color: "#bbb", margin: "14px 0 0 0", fontWeight: 600 }}>
              Pick corridor · Choose audience · Generate in 30s
            </p>
          </div>

          {/* Right — stats card */}
          <div style={{ flexShrink: 0, width: 340 }}>
            <div style={{ border: "2px solid #0A0A0A", borderRadius: 18, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "#0A0A0A", padding: "18px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#FFE234", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px 0" }}>Fee comparison</p>
                <p style={{ fontSize: 12, color: "#555", margin: 0 }}>On a $500 transfer</p>
              </div>
              {/* Rows */}
              {[
                { name: "Blaze", fee: "$2.50", pct: "0.5%", highlight: true },
                { name: "Remitly", fee: "$7.25–$14.95", pct: "1.5–3%", highlight: false },
                { name: "MoneyGram", fee: "$17.50", pct: "3.5%", highlight: false },
                { name: "Western Union", fee: "$20.00", pct: "4%", highlight: false },
              ].map((row, i) => (
                <div key={row.name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 22px",
                  background: row.highlight ? "#FFFAEB" : "#FFFFFF",
                  borderTop: i === 0 ? "none" : "1px solid #F0F0F0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {row.highlight && <span style={{ fontSize: 14 }}>⚡</span>}
                    <span style={{ fontSize: 14, fontWeight: row.highlight ? 900 : 500, color: "#0A0A0A" }}>{row.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: row.highlight ? "#0A0A0A" : "#888" }}>{row.fee}</span>
                    <span style={{ fontSize: 11, color: row.highlight ? "#B45309" : "#ccc", marginLeft: 6 }}>{row.pct}</span>
                  </div>
                </div>
              ))}
              {/* Savings row */}
              <div style={{ background: "#FFE234", padding: "14px 22px", borderTop: "2px solid #0A0A0A" }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: "#0A0A0A", margin: "0 0 2px 0" }}>You save vs WU</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#0A0A0A", margin: 0, letterSpacing: "-0.03em" }}>$17.50 per transfer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Corridors + features row */}
        <div style={{ marginTop: 80, paddingTop: 48, borderTop: "1px solid #F0F0F0" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#bbb", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 24px 0" }}>Corridors covered</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            {[
              "🇺🇸→🇲🇽 US → Mexico",
              "🇺🇸→🇮🇳 US → India",
              "🇺🇸→🇵🇭 US → Philippines",
              "🇺🇸→🇳🇬 US → Nigeria",
              "🇺🇸→🇬🇹 US → Guatemala",
              "🇺🇸→🇸🇻 US → El Salvador",
            ].map(c => (
              <span key={c} style={{
                fontSize: 13, fontWeight: 700, color: "#0A0A0A",
                background: "#F5F5F5", borderRadius: 99,
                padding: "8px 16px",
              }}>{c}</span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 80 }}>
            {[
              {
                icon: "🎯",
                title: "Corridor-specific hooks",
                body: "Every script references real cultural moments — quinceañera season, Diwali, OFW culture. Not generic UGC.",
              },
              {
                icon: "💰",
                title: "Exact fee callouts",
                body: "\"Blaze: $2.50. Western Union: $20.00. You just kept $17.50.\" Real numbers, on screen, every time.",
              },
              {
                icon: "🧪",
                title: "Built-in A/B experiment",
                body: "Every brief is a variant. The tool gives you a full experiment plan — what to post, when, and what to measure.",
              },
            ].map(item => (
              <div key={item.title} style={{ padding: "24px 24px", background: "#FAFAFA", borderRadius: 14 }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{item.icon}</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#0A0A0A", margin: "0 0 8px 0" }}>{item.title}</p>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            textAlign: "center", padding: "48px 0 80px",
            borderTop: "1px solid #F0F0F0",
          }}>
            <p style={{ fontSize: 13, color: "#bbb", fontWeight: 600, margin: "0 0 20px 0" }}>Ready to generate?</p>
            <button
              onClick={() => router.push("/build")}
              style={{
                background: "#FFE234", color: "#0A0A0A",
                border: "2px solid #0A0A0A", borderRadius: 12,
                padding: "15px 40px", fontSize: 15, fontWeight: 900,
                cursor: "pointer", letterSpacing: "-0.02em",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Start creating scripts →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
