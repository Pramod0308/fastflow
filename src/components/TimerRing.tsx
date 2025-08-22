import { Box } from '@mui/material';
import React from 'react';

type Props = { elapsedMs: number; targetHours: number; variant?: 'fast' | 'eat' };

export default function TimerRing({ elapsedMs, targetHours, variant = 'fast' }: Props) {
  const r = 100, sw = 18, c = 2 * Math.PI * r;
  const pct = Math.min(1, elapsedMs / (targetHours * 3600000));
  const dash = `${pct * c} ${c}`;
  const rInner = r - sw / 2 - 3;
  const id = `ring-${variant}`;
  const track = variant === 'fast' ? '#E7F3F1' : '#FDEFE9';

  return (
    <Box sx={{ position: 'relative', width: 260, height: 260 }}>
      <svg width="260" height="260" viewBox="0 0 240 240">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {variant === 'fast' ? (
              <>
                <stop offset="0" stopColor="#26C6DA" />
                <stop offset="1" stopColor="#00897B" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#FFAB91" />
                <stop offset="1" stopColor="#FF7043" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r={r} stroke={track} strokeWidth={sw} fill="none" />
        <circle
          cx="120" cy="120" r={r}
          stroke={`url(#${id})`} strokeWidth={sw} fill="none"
          strokeDasharray={dash} strokeLinecap="round"
          transform="rotate(-90 120 120)"
        />
        {/* inner disc so numbers never overlap arc */}
        <circle cx="120" cy="120" r={rInner} fill="#ffffff" opacity="0.92" />
      </svg>
    </Box>
  );
}
