import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import React from 'react';
import { PHASES } from '../lib/stats';

export default function PhaseList({ hours }: { hours: number }) {
  return (
    <List dense sx={{ bgcolor: 'transparent', borderRadius: 3, p: 1 }}>
      {PHASES.map((p) => {
        const reached = hours >= p.hours;
        return (
          <ListItem
            key={p.label}
            sx={{
              borderRadius: 3,
              mb: 1,
              px: 1.25,
              ...(reached && { bgcolor: 'rgba(0,137,123,.06)' }),
            }}
          >
            <ListItemIcon sx={{ minWidth: 44, opacity: reached ? 1 : 0.55 }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
            </ListItemIcon>

            <ListItemText
              primary={p.label}
              secondary={`${p.hours}h — ${p.desc}`}
              primaryTypographyProps={{ fontWeight: 800 }}
            />

            {/* Icon-only status (no text) */}
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 999,
                bgcolor: reached ? 'rgba(46,125,50,0.12)' : 'rgba(0,0,0,0.06)',
                display: 'grid',
                placeItems: 'center',
                minWidth: 36,
              }}
            >
              {reached ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
              ) : (
                <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              )}
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}
