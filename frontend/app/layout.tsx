import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blaze UGC — Creator Briefs for Every Corridor",
  description: "Generate corridor-specific TikTok/Reels creator briefs with real fee comparisons and A/B experiment plans.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
