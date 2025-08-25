import React, { useMemo, useState } from 'react';
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  ListItemIcon,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import { useStore } from '../state/store';
import EditFastDialog from './EditFastDialog';

export default function PastFastsList() {
  const { fasts, updateFastTimes } = useStore();
  const [editing, setEditing] =
    useState<{ id: string; startAt: number; endAt: number } | null>(null);

  const past = useMemo(
    () => fasts.filter(f => f.endAt).sort((a, b) => (b.endAt! - a.endAt!)).slice(0, 50),
    [fasts]
  );

  return (
    <>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>History (edit previous fasts)</Typography>
        <Chip size="small" label={`${past.length}`} />
      </Stack>

      <List dense sx={{ px: 0 }}>
        {past.map((f, i) => {
          const durH = ((f.endAt! - f.startAt) / 3600000).toFixed(1);
          const dayBadge = dayjs(f.endAt!).format('ddd');

          return (
            <ListItem
              key={f.id}
              sx={{
                my: 1,
                px: 1.25,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,.55)',
                border: '1px solid rgba(0,0,0,.06)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 24px rgba(0,0,0,.06)',
                transition: 'transform .12s ease, box-shadow .12s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 14px 30px rgba(0,0,0,.10)',
                },
              }}
              secondaryAction={
                <IconButton edge="end" aria-label="edit"
                  onClick={() => setEditing({ id: f.id, startAt: f.startAt, endAt: f.endAt! })}>
                  <EditIcon />
                </IconButton>
              }
            >
              {/* left day badge */}
              <ListItemIcon sx={{ minWidth: 44 }}>
                <div
                  style={{
                    height: 36,
                    width: 36,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background:
                      i % 2 === 0
                        ? 'linear-gradient(135deg,#E0F7FA,#B2DFDB)'
                        : 'linear-gradient(135deg,#FFF3E0,#FFE0B2)',
                    fontWeight: 800,
                    fontSize: 12,
                    color: '#324',
                  }}
                >
                  {dayBadge}
                </div>
              </ListItemIcon>

              <ListItemText
                primaryTypographyProps={{ fontWeight: 700, fontSize: 15 }}
                secondaryTypographyProps={{ component: 'div' }}
                primary={`${dayjs(f.startAt).format('MMM D, HH:mm')} → ${dayjs(f.endAt!).format('MMM D, HH:mm')}`}
                secondary={
                  <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                      label={`${durH} h`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                      label={String(f.plan)}
                      variant="outlined"
                    />
                  </Stack>
                }
              />
            </ListItem>
          );
        })}

        {past.length === 0 && (
          <Typography variant="body2" color="text.secondary">No past fasts yet.</Typography>
        )}
      </List>

      {editing && (
        <EditFastDialog
          open
          initialStart={editing.startAt}
          initialEnd={editing.endAt}
          onClose={() => setEditing(null)}
          onSave={({ startAt, endAt }) => {
            updateFastTimes(editing.id, startAt, endAt);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
