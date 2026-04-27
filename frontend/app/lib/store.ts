import type { Campaign, BriefInput } from "./types";

const CAMPAIGN_KEY   = "blaze_campaign";
const BRIEF_KEY      = "blaze_brief_input";

export function saveCampaign(data: Campaign): void {
  try { sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(data)); } catch {}
}
export function loadCampaign(): Campaign | null {
  try { const r = sessionStorage.getItem(CAMPAIGN_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export function saveBriefInput(input: BriefInput): void {
  try { sessionStorage.setItem(BRIEF_KEY, JSON.stringify(input)); } catch {}
}
export function loadBriefInput(): BriefInput | null {
  try { const r = sessionStorage.getItem(BRIEF_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export function clearSession(): void {
  try {
    [CAMPAIGN_KEY, BRIEF_KEY].forEach(k => sessionStorage.removeItem(k));
  } catch {}
}
