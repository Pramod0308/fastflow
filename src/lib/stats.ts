import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export const PHASES = [
  { label: 'Blood Sugar Drop', hours: 3, icon: '💧', desc: 'Insulin begins to fall; body switches to stored energy.' },
  { label: 'Gluconeogenesis', hours: 5, icon: '🧬', desc: 'Liver makes glucose to keep levels steady.' },
  { label: 'Ketosis', hours: 8, icon: '🔥', desc: 'Fat becomes ketones to fuel brain and muscles.' },
  { label: 'Fat Burning', hours: 12, icon: '⚡', desc: 'Lipolysis ramps up; body preferentially burns fat.' },
  { label: 'Autophagy', hours: 18, icon: '🧹', desc: 'Cells recycle worn components (cleanup mode).' }
];

export function msToH(ms: number) {
  return Math.max(0, ms) / 3_600_000;
}

export function prettyHms(ms: number) {
  const d = dayjs.duration(ms);
  const h = Math.floor(d.asHours());
  const m = d.minutes().toString().padStart(2, '0');
  const s = d.seconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function last7DaysBuckets(fasts: { startAt: number; endAt?: number }[]) {
  const start = dayjs().startOf('day').subtract(6, 'day');
  const buckets = Array.from({ length: 7 }).map((_, i) => ({
    date: start.add(i, 'day'),
    totalMs: 0
  }));

  for (const f of fasts) {
    if (!f.endAt) continue;
    const end = dayjs(f.endAt);
    const idx = end.startOf('day').diff(start, 'day');
    if (idx >= 0 && idx < 7) {
      buckets[idx].totalMs += Math.max(0, f.endAt - f.startAt);
    }
  }
  return buckets.map((b) => ({ name: b.date.format('ddd'), hours: +(b.totalMs / 3_600_000).toFixed(1) }));
}

// REPLACE the existing computeStreak with this version
export function computeStreak(
  fasts: { endAt?: number; startAt: number }[],
  minHours = 16
) {
  const byDay = new Set<string>();
  for (const f of fasts) {
    if (!f.endAt) continue;
    const hours = (f.endAt - f.startAt) / 3_600_000;
    if (hours >= minHours) {
      byDay.add(dayjs(f.endAt).startOf('day').format('YYYY-MM-DD'));
    }
  }

  const today = dayjs().startOf('day');
  let day = byDay.has(today.format('YYYY-MM-DD')) ? today : today.subtract(1, 'day');

  let streak = 0;
  while (byDay.has(day.format('YYYY-MM-DD'))) {
    streak++;
    day = day.subtract(1, 'day');
  }
  return streak;
}


/** Best streak ever: longest run of consecutive days (anywhere in history) with a completed fast ≥ minHours. */
export function computeBestStreak(
  fasts: { endAt?: number; startAt: number }[],
  minHours = 16
) {
  // mark each day that qualifies
  const days = new Set<string>();
  for (const f of fasts) {
    if (!f.endAt) continue;
    const hours = (f.endAt - f.startAt) / 3_600_000;
    if (hours >= minHours) {
      days.add(dayjs(f.endAt).startOf('day').format('YYYY-MM-DD'));
    }
  }
  if (days.size === 0) return 0;

  // turn set into sorted array of dayjs objects
  const sorted = [...days].map(d => dayjs(d)).sort((a,b) => a.valueOf() - b.valueOf());

  let best = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].diff(sorted[i-1], 'day') === 1) {
      cur++;
    } else {
      best = Math.max(best, cur);
      cur = 1;
    }
  }
  best = Math.max(best, cur);
  return best;
}
