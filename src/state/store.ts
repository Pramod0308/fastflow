import { create } from 'zustand';
import { nanoid } from './uuid';
import type { Fast, Settings } from '../types';
import { loadFasts, saveFasts, loadSettings, saveSettings } from '../lib/db';

type Store = {
  fasts: Fast[];
  settings: Settings;
  hydrated: boolean;
  current?: Fast;
  init: () => Promise<void>;
  startFast: (targetHours: number, plan: string) => void;
  endFast: () => void;
  updateSettings: (p: Partial<Settings>) => void;
  updateCurrentStart: (newStart: number) => void;
  updateFastTimes: (id: string, startAt: number, endAt: number) => void;
  exportJson: () => string;
  importJson: (json: string) => Promise<void>;
};

export const useStore = create<Store>((set, get) => ({
  fasts: [],
  settings: { defaultPlan: '16/8', defaultTargetHours: 16, use24h: true },
  hydrated: false,
  current: undefined,

  init: async () => {
    const [fasts, settings] = await Promise.all([loadFasts(), loadSettings()]);
    const current = fasts.find(f => !f.endAt);
    set({ fasts, settings, current, hydrated: true });
  },

  startFast: (targetHours, plan) => {
    const now = Date.now();
    const newFast: Fast = { id: nanoid(), startAt: now, targetHours, plan };
    const fasts = [...get().fasts, newFast];
    // clear eating timer
    const s = { ...get().settings, eatingStartAt: undefined, eatingTargetHours: undefined };
    set({ fasts, current: newFast, settings: s });
    saveFasts(fasts); saveSettings(s);
  },

  endFast: () => {
    const cur = get().current;
    if (!cur) return;
    const now = Date.now();
    const ended = { ...cur, endAt: now };
    const fasts = get().fasts.map(f => (f.id === cur.id ? ended : f));
    // start eating timer: target window = 24 - fasting hours
    const eatTarget = Math.max(1, 24 - (cur.targetHours || 16));
    const s = { ...get().settings, eatingStartAt: now, eatingTargetHours: eatTarget };
    set({ fasts, current: undefined, settings: s });
    saveFasts(fasts); saveSettings(s);
  },

  updateSettings: (p) => {
    const next = { ...get().settings, ...p };
    set({ settings: next });
    saveSettings(next);
  },

  updateCurrentStart: (newStart) => {
    const cur = get().current;
    if (!cur) return;
    const updated = { ...cur, startAt: newStart };
    const fasts = get().fasts.map(f => (f.id === cur.id ? updated : f));
    set({ fasts, current: updated });
    saveFasts(fasts);
  },

  // edit any historical fast
updateFastTimes: (id, startAt, endAt) => {
  const fasts = get().fasts.map(f => (f.id === id ? { ...f, startAt, endAt } : f));
  const current = fasts.find(f => !f.endAt);

  // Re-align eating window when not fasting:
  let settings = get().settings;
  if (!current) {
    const latest = fasts
      .filter(f => f.endAt)
      .sort((a, b) => (b.endAt! - a.endAt!))[0];

    if (latest) {
      settings = {
        ...settings,
        eatingStartAt: latest.endAt,                         // start of eating = last endAt
        eatingTargetHours: Math.max(1, 24 - (latest.targetHours || 16)) // e.g., 16/8 -> 8
      };
    } else {
      // no completed fasts -> clear eating timer
      settings = { ...settings, eatingStartAt: undefined, eatingTargetHours: undefined };
    }
    saveSettings(settings);
  }

  set({ fasts, current, settings });
  saveFasts(fasts);
},


  exportJson: () => JSON.stringify({ fasts: get().fasts, settings: get().settings }, null, 2),

  importJson: async (json: string) => {
    const obj = JSON.parse(json);
    const fasts: Fast[] = obj.fasts ?? [];
    const settings: Settings = obj.settings ?? get().settings;
    await Promise.all([saveFasts(fasts), saveSettings(settings)]);
    set({ fasts, settings, current: fasts.find(f => !f.endAt) });
  }
}));
