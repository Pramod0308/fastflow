
import { get, set } from 'idb-keyval';
import type { Fast, Settings } from '../types';

const KEYS = {
  FASTS: 'fastflow.fasts',
  SETTINGS: 'fastflow.settings'
} as const;

export async function loadFasts(): Promise<Fast[]> {
  return (await get(KEYS.FASTS)) ?? [];
}
export async function saveFasts(fasts: Fast[]) {
  return set(KEYS.FASTS, fasts);
}
export async function loadSettings(): Promise<Settings> {
  return (await get(KEYS.SETTINGS)) ?? {
    defaultPlan: '16/8',
    defaultTargetHours: 16,
    use24h: true
  };
}
export async function saveSettings(s: Settings) {
  return set(KEYS.SETTINGS, s);
}
