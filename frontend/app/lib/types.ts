export interface BriefInput {
  corridor: string;
  audience: string;
  content_style: string;
  message_angle: string;
  platform: string;
  campaign_goal: string;
  script_count: number;
}

export interface Script {
  id: number;
  title: string;
  angle: string;
  hook: string;
  script: string;
  scene_breakdown: string[];
  fee_callout: string;
  cta: string;
  creator_direction: string;
  hashtags: string[];
  estimated_duration: string;
  emotion_trigger: string;
}

export interface ExperimentVariant {
  label: string;       // "A", "B", "C"
  script_id: number;   // ties back to script.id
  hook_type: string;   // angle being tested
  why: string;         // why this angle works
  target: string;      // sub-segment
}

export interface ExperimentPlan {
  hypothesis: string;
  variants: ExperimentVariant[];
  primary_metric: string;
  secondary_metrics: string[];
  winning_signal: string;
  posting_cadence: string;
  timeline: string;
}

export interface FeeSummary {
  blaze: string;
  wu: string;
  remitly: string;
  savings_vs_wu: string;
  savings_vs_remitly: string;
}

export interface Campaign {
  campaign_name: string;
  corridor_insight: string;
  fee_summary: FeeSummary;
  scripts: Script[];
  experiment_plan: ExperimentPlan;
  brief_input?: BriefInput;
}
