export type PlanKey = '16/8' | '20/4' | 'Custom';

export interface Fast {
  id: string;
  startAt: number;
  endAt?: number;
  targetHours: number;
  plan: PlanKey | string;
  notes?: string;
}

export interface Settings {
  defaultPlan: PlanKey;
  defaultTargetHours: number;
  use24h: boolean;
  eatingStartAt?: number;      // set after ending a fast
  eatingTargetHours?: number;  // typically 24 - targetHours
}
