import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, IconButton, Typography, Stack, Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemIcon, ListItemText, Divider, Tooltip, Fade,
  TextField, Button, Alert
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import dayjs from 'dayjs';
import type { Fast } from '../types';
import { useStore } from '../state/store';

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
  const { updateFastTimes } = useStore();

  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selected, setSelected] = useState<null | dayjs.Dayjs>(null);

  // group completed fasts by END day (key = YYYY-MM-DD)
  const byDay = useMemo(() => {
    const m = new Map<string, { id: string; startAt: number; endAt: number; hours: number; plan: string }[]>();
    for (const f of fasts) {
      if (!f.endAt) continue;
      const key = dayjs(f.endAt).format('YYYY-MM-DD');
      const hours = (f.endAt - f.startAt) / 3_600_000;
      const arr = m.get(key) ?? [];
      arr.push({ id: f.id, startAt: f.startAt, endAt: f.endAt, hours, plan: String(f.plan) });
      m.set(key, arr);
    }
    return m;
  }, [fasts]);

  // latest completed fast overall (for editing)
  const latest = useMemo(() => {
    const completed = fasts.filter(f => f.endAt);
    if (!completed.length) return null;
    return completed.reduce((a, b) => (a.endAt! > b.endAt! ? a : b));
  }, [fasts]);

  // Only render this month's real days (no leading/trailing placeholders)
  const days = useMemo(() => {
    const first = month.startOf('month');
    const total = month.daysInMonth();
    const startCol = ((first.day() - weekStartsOn + 7) % 7) + 1; // 1..7 for CSS grid
    return Array.from({ length: total }, (_, i) => {
      const date = first.add(i, 'day');
      return { date, colStart: i === 0 ? startCol : undefined };
    });
  }, [month, weekStartsOn]);

  // helpers
  const listFor = (d: dayjs.Dayjs) => byDay.get(d.format('YYYY-MM-DD')) ?? [];
  const statusOf = (d: dayjs.Dayjs) => {
    const list = listFor(d);
    if (list.some(x => x.hours >= minHours)) return 'success' as const;
    if (list.length > 0) return 'partial' as const;
    return 'none' as const;
  };
  const hasData = (d: dayjs.Dayjs) => listFor(d).length > 0;

  const openDetails = (d: dayjs.Dayjs) => setSelected(d);
  const closeDetails = () => setSelected(null);

  // --- Edit last fast state (shown only when selected day == latest end day) ---
  const isSelectedLatest =
    !!selected && !!latest && dayjs(latest.endAt!).isSame(selected, 'day');

  const [endValue, setEndValue] = useState<string>('');
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    if (isSelectedLatest && latest) {
      setEndValue(dayjs(latest.endAt!).format('YYYY-MM-DDTHH:mm'));
      setErr('');
    }
  }, [isSelectedLatest, latest]);

  const validateEnd = (v: string) => {
    if (!latest) return 'No last fast found.';
    const ts = dayjs(v).valueOf();
    if (!dayjs(v).isValid()) return 'Invalid date/time.';
    if (ts < latest.startAt) return 'End time must be after start time.';
    if (ts > Date.now()) return 'End time cannot be in the future.';
    return '';
  };

  const saveEnd = () => {
    if (!latest) return;
    const message = validateEnd(endValue);
    if (message) { setErr(message); return; }
    const newEnd = dayjs(endValue).valueOf();
    updateFastTimes(latest.id, latest.startAt, newEnd);
    setSelected(null); // close; parent will re-render with updated data
  };

  const bump = (mins: number) => {
    const ts = dayjs(endValue).add(mins, 'minute');
    setEndValue(ts.format('YYYY-MM-DDTHH:mm'));
    const m = validateEnd(ts.toISOString());
    setErr(m);
  };

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

          const styles =
            status === 'success'
              ? {
                  background: 'linear-gradient(135deg, #CFF6E8 0%, #A7E7DB 100%)',
                  color: '#0B3B33',
                  border: '1px solid rgba(38,166,154,0.70)',
                  boxShadow: '0 10px 22px rgba(38,166,154,0.22)',
                }
              : {
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: 'text.primary',
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

                  {/* partial dot (keep) */}
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

      {/* Details / Edit dialog */}
      <Dialog open={Boolean(selected)} onClose={closeDetails} fullWidth TransitionProps={{ timeout: 220 }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon color="primary" />
            <span>{selected?.format('dddd, MMM D')}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {/* Edit last fast's end time if this is the latest's end day */}
          {isSelectedLatest && latest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Edit end time (last fast)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  type="datetime-local"
                  value={endValue}
                  onChange={(e) => setEndValue(e.target.value)}
                  helperText="Adjust when your last fast ended"
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" onClick={() => bump(-15)}>-15m</Button>
                <Button variant="outlined" onClick={() => bump(15)}>+15m</Button>
                <Button variant="contained" onClick={saveEnd}>Save</Button>
              </Stack>
              {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          {/* List of fasts for the day */}
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
                        secondary={`${((it.endAt - it.startAt) / 3_600_000).toFixed(1)}h • ${it.plan}`}
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
