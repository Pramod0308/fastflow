
import { Box } from '@mui/material';
import React from 'react';

type Props = {
  elapsedMs: number;
  targetHours: number;
};

export default function TimerRing({ elapsedMs, targetHours }: Props) {
  const r = 100;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, elapsedMs / (targetHours * 3600000));
  const dash = `${pct * c} ${c}`;

  return (
    <Box sx={{ position: 'relative', width: 260, height: 260 }}>
      <svg width="260" height="260" viewBox="0 0 240 240">
        <circle cx="120" cy="120" r={r} stroke="#e6f3f1" strokeWidth="18" fill="none" />
        <circle
          cx="120"
          cy="120"
          r={r}
          stroke="currentColor"
          strokeWidth="18"
          fill="none"
          strokeDasharray={dash}
          strokeLinecap="round"
          transform="rotate(-90 120 120)"
        />
      </svg>
    </Box>
  );
}
