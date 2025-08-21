
export type PlanKey = '16/8' | '18/6' | '20/4' | 'OMAD' | 'Custom';

export interface Fast {
  id: string;
  startAt: number;   // epoch ms
  endAt?: number;    // epoch ms when completed
  targetHours: number;
  plan: PlanKey | string;
  notes?: string;
}

export interface Settings {
  defaultPlan: PlanKey;
  defaultTargetHours: number;
  use24h: boolean;
}
