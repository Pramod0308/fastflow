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

/**
 * Streak counts consecutive days with a qualifying fast (>= minHours).
 * If there is an ongoing fast today that already meets the threshold,
 * today is counted; otherwise we start counting from yesterday so the
 * streak doesn’t drop to 0 every morning.
 */
export function computeStreak(
  fasts: { endAt?: number; startAt: number }[],
  minHours = 12,
  ongoingMs = 0
) {
  const byDay = new Map<string, boolean>();

  // Completed fasts
  for (const f of fasts) {
    if (!f.endAt) continue;
    const hours = (f.endAt - f.startAt) / 3_600_000;
    if (hours >= minHours) {
      const key = dayjs(f.endAt).startOf('day').format('YYYY-MM-DD');
      byDay.set(key, true);
    }
  }

  // Ongoing fast qualifies for today?
  if (ongoingMs / 3_600_000 >= minHours) {
    byDay.set(dayjs().startOf('day').format('YYYY-MM-DD'), true);
  }

  // Start from today if qualified; else from yesterday
  let day = dayjs().startOf('day');
  if (!byDay.get(day.format('YYYY-MM-DD'))) {
    day = day.subtract(1, 'day');
  }

  let streak = 0;
  while (byDay.get(day.format('YYYY-MM-DD'))) {
    streak++;
    day = day.subtract(1, 'day');
  }
  return streak;
}
