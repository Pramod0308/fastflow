import { Typography } from '@mui/material';
import React from 'react';

export default function StreakCard({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 28 }}>🔥</span>
      <div>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{count} day{count === 1 ? '' : 's'}</Typography>
        <Typography variant="body2" color="text.secondary">Current streak</Typography>
      </div>
    </div>
  );
}
