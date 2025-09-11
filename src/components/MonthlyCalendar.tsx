import React, { useMemo, useState } from 'react';
import {
  Box, IconButton, Typography, Stack, Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemIcon, ListItemText, Divider, Tooltip, Fade
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import dayjs from 'dayjs';
import type { Fast } from '../types';

type Props = {
  fasts: Fast[];
  /** threshold for a “green day” (completed fast >= minHours) */
  minHours?: number;
  /** 0: Sunday, 1: Monday */
  weekStartsOn?: 0 | 1;
};

export default function MonthlyCalendar({
  fasts,
  minHours = 16,
  weekStartsOn = 0
}: Props) {
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selected, setSelected] = useState<null | dayjs.Dayjs>(null);

  // group completed fasts by END day (key = YYYY-MM-DD)
  const byDay = useMemo(() => {
    const m = new Map<string, { startAt: number; endAt: number; hours: number; plan: string }[]>();
    for (const f of fasts) {
      if (!f.endAt) continue;
      const key = dayjs(f.endAt).format('YYYY-MM-DD');
      const hours = (f.endAt - f.startAt) / 3_600_000;
      const arr = m.get(key) ?? [];
      arr.push({ startAt: f.startAt, endAt: f.endAt, hours, plan: String(f.plan) });
      m.set(key, arr);
    }
    return m;
  }, [fasts]);

  // Only render days that belong to the current month (no leading/trailing cells).
  // Use gridColumnStart on day 1 so weekday alignment is preserved without placeholders.
  const days = useMemo(() => {
    const first = month.startOf('month');
    const total = month.daysInMonth();
    const startCol = ((first.day() - weekStartsOn + 7) % 7) + 1; // 1..7 for CSS grid
    return Array.from({ length: total }, (_, i) => {
      const date = first.add(i, 'day');
      return { date, colStart: i === 0 ? startCol : undefined };
    });
  }, [month, weekStartsOn]);

  // status helpers
  const dayList = (d: dayjs.Dayjs) => byDay.get(d.format('YYYY-MM-DD')) ?? [];
  const statusOf = (d: dayjs.Dayjs) => {
    const list = dayList(d);
    if (list.some(x => x.hours >= minHours)) return 'success' as const;
    if (list.length > 0) return 'partial' as const;
    return 'none' as const;
  };
  const hasData = (d: dayjs.Dayjs) => dayList(d).length > 0;

  const openDetails = (d: dayjs.Dayjs) => setSelected(d);
  const closeDetails = () => setSelected(null);

  const header = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <IconButton onClick={() => setMonth(m => m.subtract(1, 'month'))}><ChevronLeftIcon /></IconButton>
      <Stack alignItems="center" spacing={0}>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.4 }}>
          {month.format('MMMM YYYY')}
        </Typography>
        <Typography variant="caption" color="text.secondary">Tap a date to see details</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <IconButton onClick={() => setMonth(dayjs().startOf('month'))} title="Today"><TodayIcon /></IconButton>
        <IconButton onClick={() => setMonth(m => m.add(1, 'month'))}><ChevronRightIcon /></IconButton>
      </Stack>
    </Stack>
  );

  const dow = Array.from({ length: 7 }).map((_, i) => {
    const d = (i + weekStartsOn) % 7;
    return dayjs().day(d).format('dd'); // Su Mo ...
  });

  return (
    <Box>
      {header}

      {/* Weekday header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', px: 0.5, mb: 0.5 }}>
        {dow.map((name) => (
          <Typography key={name} variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 0.5 }}>
            {name}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid (only real days) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75 }}>
        {days.map(({ date, colStart }) => {
          const key = date.format('YYYY-MM-DD');
          const status = statusOf(date);
          const interactive = hasData(date);
          const today = date.isSame(dayjs(), 'day');

          // Visuals — ALWAYS readable day number
          const styles =
            status === 'success'
              ? {
                  // proper gradient background and dark text for contrast
                  background: 'linear-gradient(135deg, #CFF6E8 0%, #A7E7DB 100%)',
                  color: '#0B3B33',
                  border: '1px solid rgba(38,166,154,0.70)',
                  boxShadow: '0 10px 22px rgba(38,166,154,0.22)',
                }
              : {
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: 'var(--mui-palette-text-primary)',
                  border: today ? '2px solid rgba(0,137,123,.65)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                };

          return (
            <Fade in timeout={200} key={key}>
              <Tooltip
                title={interactive ? 'View fasts for this day' : ''}
                arrow
                disableHoverListener={!interactive}
              >
                <Box
                  onClick={() => interactive && openDetails(date)}
                  sx={{
                    gridColumnStart: colStart,
                    position: 'relative',
                    height: 44,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: interactive ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'transform .12s ease, box-shadow .12s ease, background .12s ease',
                    ...styles,
                    '&:hover': interactive ? { transform: 'translateY(-2px)', boxShadow: '0 12px 26px rgba(0,0,0,0.12)' } : {},
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1 }}>
                    {date.date()}
                  </Typography>

                  {/* success checkmark */}
                  {status === 'success' && (
                    <CheckCircleRoundedIcon
                      sx={{ position: 'absolute', right: 6, bottom: 6, fontSize: 16, color: '#0B3B33', opacity: 0.8 }}
                    />
                  )}

                  {/* partial dot */}
                  {status === 'partial' && (
                    <RadioButtonUncheckedIcon
                      sx={{ position: 'absolute', right: 8, bottom: 8, fontSize: 10, color: 'warning.main', opacity: 0.9 }}
                    />
                  )}
                </Box>
              </Tooltip>
            </Fade>
          );
        })}
      </Box>

      {/* Details dialog */}
      <Dialog open={Boolean(selected)} onClose={closeDetails} fullWidth TransitionProps={{ timeout: 220 }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon color="primary" />
            <span>{selected?.format('dddd, MMM D')}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {(() => {
            const list = selected ? (byDay.get(selected.format('YYYY-MM-DD')) ?? []) : [];
            if (!list.length) return <Typography color="text.secondary">No fast completed on this day.</Typography>;
            const sorted = [...list].sort((a, b) => a.startAt - b.startAt);
            return (
              <List dense>
                {sorted.map((it, i) => (
                  <React.Fragment key={i}>
                    <ListItem>
                      <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                      <ListItemText
                        primary={`${dayjs(it.startAt).format('MMM D, HH:mm')} → ${dayjs(it.endAt).format('MMM D, HH:mm')}`}
                        secondary={`${it.hours.toFixed(1)}h • ${it.plan}`}
                        primaryTypographyProps={{ fontWeight: 700 }}
                      />
                    </ListItem>
                    {i < sorted.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
