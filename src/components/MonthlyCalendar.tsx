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
import dayjs from 'dayjs';
import type { Fast } from '../types';

type Props = {
  fasts: Fast[];
  /** threshold for “green day” */
  minHours?: number;
  /** start week on Sunday (0) or Monday (1) */
  weekStartsOn?: 0 | 1;
};

export default function MonthlyCalendar({ fasts, minHours = 16, weekStartsOn = 0 }: Props) {
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selected, setSelected] = useState<null | dayjs.Dayjs>(null);

  // group completed fasts by day (key = YYYY-MM-DD based on endAt)
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

  // build a 6x7 matrix for the month (with leading/trailing days)
  const days = useMemo(() => {
    const first = month.startOf('month');
    const last = month.endOf('month');
    const firstWeekday = (first.day() - weekStartsOn + 7) % 7; // 0..6
    const arr: { date: dayjs.Dayjs; inMonth: boolean }[] = [];

    // leading
    for (let i = 0; i < firstWeekday; i++) {
      arr.push({ date: first.subtract(firstWeekday - i, 'day'), inMonth: false });
    }
    // current month
    for (let d = 0; d < last.date(); d++) {
      arr.push({ date: first.add(d, 'day'), inMonth: true });
    }
    // trailing to fill 6 weeks
    const total = Math.ceil(arr.length / 7) * 7;
    for (let i = arr.length; i < total; i++) {
      arr.push({ date: last.add(i - arr.length + 1, 'day'), inMonth: false });
    }
    return arr;
  }, [month, weekStartsOn]);

  const isGreen = (d: dayjs.Dayjs) => {
    const key = d.format('YYYY-MM-DD');
    const list = byDay.get(key) ?? [];
    return list.some((x) => x.hours >= minHours);
  };

  const hasData = (d: dayjs.Dayjs) => (byDay.get(d.format('YYYY-MM-DD')) ?? []).length > 0;

  const openDetails = (d: dayjs.Dayjs) => setSelected(d);
  const closeDetails = () => setSelected(null);

  const header = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <IconButton onClick={() => setMonth((m) => m.subtract(1, 'month'))}><ChevronLeftIcon /></IconButton>
      <Stack alignItems="center" spacing={0}>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.4 }}>
          {month.format('MMMM YYYY')}
        </Typography>
        <Typography variant="caption" color="text.secondary">Tap a date to see details</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <IconButton onClick={() => setMonth(dayjs().startOf('month'))} title="Today"><TodayIcon /></IconButton>
        <IconButton onClick={() => setMonth((m) => m.add(1, 'month'))}><ChevronRightIcon /></IconButton>
      </Stack>
    </Stack>
  );

  const dow = Array.from({ length: 7 }).map((_, i) => {
    const d = (i + weekStartsOn) % 7;
    return dayjs().day(d).format('dd'); // Mo, Tu...
  });

  return (
    <Box>
      {header}

      {/* days of week header */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        px: 0.5,
        mb: 0.5,
      }}>
        {dow.map((name) => (
          <Typography key={name} variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 0.5 }}>
            {name}
          </Typography>
        ))}
      </Box>

      {/* calendar grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.75,
        }}
      >
        {days.map(({ date, inMonth }, idx) => {
          const green = isGreen(date);
          const dim = !inMonth;
          const today = date.isSame(dayjs(), 'day');
          const key = date.format('YYYY-MM-DD');
          const interactive = hasData(date);

          return (
            <Fade in timeout={300} key={key}>
              <Tooltip title={interactive ? 'View details' : ''} arrow disableHoverListener={!interactive}>
                <Box
                  onClick={() => interactive && openDetails(date)}
                  sx={{
                    position: 'relative',
                    borderRadius: 2.5,
                    p: 1,
                    textAlign: 'center',
                    cursor: interactive ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'transform .12s ease, box-shadow .12s ease, background .12s ease',
                    bgcolor: green
                      ? 'linear-gradient(135deg, rgba(165,214,167,0.6), rgba(38,166,154,0.6))'
                      : 'rgba(255,255,255,0.6)',
                    border: green ? '1px solid rgba(38,166,154,0.6)' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: green ? '0 8px 20px rgba(38,166,154,0.25)' : '0 4px 16px rgba(0,0,0,0.05)',
                    opacity: dim ? 0.5 : 1,
                    '&:hover': interactive ? { transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(0,0,0,0.12)' } : {},
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}
                  >
                    {date.date()}
                  </Typography>

                  {/* tiny today indicator */}
                  {today && (
                    <Box sx={{
                      position: 'absolute', top: 6, left: 6, width: 6, height: 6, borderRadius: '50%',
                      bgcolor: 'secondary.main'
                    }} />
                  )}
                </Box>
              </Tooltip>
            </Fade>
          );
        })}
      </Box>

      {/* day details dialog */}
      <Dialog open={Boolean(selected)} onClose={closeDetails} fullWidth TransitionProps={{ timeout: 250 }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon color="primary" />
            <span>{selected?.format('dddd, MMM D')}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {(() => {
            const list = selected ? (byDay.get(selected.format('YYYY-MM-DD')) ?? []) : [];
            if (!list.length) return <Typography color="text.secondary">No fast tracked this day.</Typography>;
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
