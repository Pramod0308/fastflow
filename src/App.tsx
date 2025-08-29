import React, { useEffect, useMemo, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Button, IconButton, Menu, MenuItem,
  Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Grid
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import TimerRing from './components/TimerRing';
import PhaseList from './components/PhaseList';
import HistoryBarChart from './components/HistoryBarChart';
import StreakCard from './components/StreakCard';
import PastFastsList from './components/PastFastsList';
import GlassCard from './components/GlassCard';

import { useStore } from './state/store';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { last7DaysBuckets, msToH, prettyHms, computeStreak, computeBestStreak, PHASES } from './lib/stats';
dayjs.extend(duration);

const PLAN_TO_HOURS: Record<string, number> = { '16/8': 16, '20/4': 20, 'Custom': 16 };

export default function App() {
  const { hydrated, init, fasts, current, startFast, endFast, settings, updateSettings, exportJson, importJson, updateCurrentStart } = useStore();
  useEffect(() => { init(); }, [init]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // Fasting timer
  const elapsedMs = current ? now - current.startAt : 0;
  const elapsedText = prettyHms(elapsedMs);
  const targetHours = current?.targetHours ?? settings.defaultTargetHours;
  const hours = msToH(elapsedMs);
  const expectedEnd = current ? new Date(current.startAt + targetHours * 3_600_000) : undefined;

  // Eating timer
  const eatingActive = !current && !!settings.eatingStartAt;
  const eatingElapsedMs = eatingActive ? (now - (settings.eatingStartAt || 0)) : 0;
  const eatingElapsedText = prettyHms(eatingElapsedMs);
  const eatingTarget = settings.eatingTargetHours || 8;

  // Stats + stage
  const historyData = useMemo(() => last7DaysBuckets(fasts), [fasts]);
  const streak = useMemo(() => computeStreak(fasts, 16, 0), [fasts]);          // completed fasts ≥ 16h
  const bestStreak = useMemo(() => computeBestStreak(fasts, 16), [fasts]);      // best ever
  const stage = useMemo(() => {
    const reached = PHASES.filter(p => hours >= p.hours);
    return reached[reached.length - 1];
  }, [hours]);

  // Menus/dialogs
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  const [openSettings, setOpenSettings] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importText, setImportText] = useState('');

  // Edit start
  const [openEditStart, setOpenEditStart] = useState(false);
  const [editValue, setEditValue] = useState('');
  const openEdit = () => { if (!current) return; setEditValue(dayjs(current.startAt).format('YYYY-MM-DDTHH:mm')); setOpenEditStart(true); };
  const saveEdit = () => { if (!current) return; const ts = dayjs(editValue).valueOf(); updateCurrentStart(Math.min(ts, Date.now())); setOpenEditStart(false); };

  if (!hydrated) return null;

  const start = (plan: string) => {
    const hrs = PLAN_TO_HOURS[plan] ?? settings.defaultTargetHours;
    startFast(hrs, plan);
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} color="transparent" sx={{ backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 800, color: 'primary.main' }}>FastFlow</Typography>
          <IconButton onClick={() => setOpenSettings(true)}><SettingsIcon /></IconButton>
          <IconButton onClick={openMenu}><MoreVertIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { navigator.clipboard.writeText(exportJson()); closeMenu(); }}>Export to Clipboard</MenuItem>
        <MenuItem onClick={() => { setOpenImport(true); closeMenu(); }}>Import from JSON</MenuItem>
        <MenuItem component="a" href="https://github.com" target="_blank">Source</MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* ... Fasting/Eating cards unchanged ... */}

        {/* Stats */}
        <GlassCard title="Stats" defaultExpanded right={<HistoryIcon fontSize="small" />}>
          {/* Current + Best streak row */}
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 1, px: 1 }}>
            <StreakCard count={streak} />
            <Stack direction="row" spacing={1} alignItems="center">
              <EmojiEventsIcon color="warning" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{bestStreak} days</Typography>
                <Typography variant="body2" color="text.secondary">Best streak</Typography>
              </Box>
            </Stack>
          </Stack>

          <Box sx={{ mt: 1 }}>
            <HistoryBarChart data={historyData} />
          </Box>
        </GlassCard>

        {/* History */}
        <GlassCard title="History" defaultExpanded>
          <PastFastsList />
        </GlassCard>
      </Container>

      {/* Settings / Import / Edit dialogs ... (unchanged) */}
      {/* ... keep the rest of your dialogs here ... */}
    </>
  );
}
