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

import TimerRing from './components/TimerRing';
import PhaseList from './components/PhaseList';
import HistoryBarChart from './components/HistoryBarChart';
import StreakCard from './components/StreakCard';
import PastFastsList from './components/PastFastsList';
import GlassCard from './components/GlassCard';

import { useStore } from './state/store';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { last7DaysBuckets, msToH, prettyHms, computeStreak, PHASES } from './lib/stats';
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

  // Eating window timer (when not fasting)
  const eatingActive = !current && !!settings.eatingStartAt;
  const eatingElapsedMs = eatingActive ? (now - (settings.eatingStartAt || 0)) : 0;
  const eatingElapsedText = prettyHms(eatingElapsedMs);
  const eatingTarget = settings.eatingTargetHours || 8;

  // Stats + stage
  const historyData = useMemo(() => last7DaysBuckets(fasts), [fasts]);
  const streak = useMemo(() => computeStreak(fasts, 12, elapsedMs), [fasts, elapsedMs]);
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

  // Edit start for current fast
  const [openEditStart, setOpenEditStart] = useState(false);
  const [editValue, setEditValue] = useState('');
  const openEdit = () => {
    if (!current) return;
    setEditValue(dayjs(current.startAt).format('YYYY-MM-DDTHH:mm'));
    setOpenEditStart(true);
  };
  const saveEdit = () => {
    if (!current) return;
    const ts = dayjs(editValue).valueOf();
    updateCurrentStart(Math.min(ts, Date.now()));
    setOpenEditStart(false);
  };

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
        {/* Timer / Status */}
        <GlassCard title={current ? 'Fasting' : (eatingActive ? 'Eating time' : 'Start a fast')} defaultExpanded>
          {current ? (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>Elapsed time</Typography>
              <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
                <TimerRing elapsedMs={elapsedMs} targetHours={targetHours} variant="fast" />
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <Stack spacing={1} alignItems="center">
                    {stage && <Box sx={{ fontSize: 28, lineHeight: 1 }}>{stage.icon}</Box>}
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.main', textShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
                      {elapsedText}
                    </Typography>
                    <Chip size="small" label={`${targetHours}h target`} />
                  </Stack>
                </Box>
              </Box>

              <Grid container spacing={1.5} sx={{ mt: 2 }} justifyContent="center">
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button variant="outlined" startIcon={<EditCalendarIcon />} onClick={openEdit}>Edit start</Button>
                  <Button variant="contained" startIcon={<StopIcon />} onClick={() => endFast()}>End Fast</Button>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Started {dayjs(current.startAt).format('MMM D, HH:mm')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chip size="small" color="secondary" sx={{ mt: 1 }} label={`Ends ${dayjs(expectedEnd).format('MMM D, HH:mm')}`} />
              </Box>
            </>
          ) : eatingActive ? (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>Eating window</Typography>
              <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
                <TimerRing elapsedMs={eatingElapsedMs} targetHours={eatingTarget} variant="eat" />
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <Stack spacing={1} alignItems="center">
                    <Box sx={{ fontSize: 26 }}>🥗</Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'warning.main', textShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
                      {eatingElapsedText}
                    </Typography>
                    <Chip size="small" label={`${eatingTarget}h target`} />
                  </Stack>
                </Box>
              </Box>

              <Grid container spacing={1.5} sx={{ mt: 2 }} justifyContent="center">
                {(['16/8', '20/4'] as const).map(p => (
                  <Grid item xs={6} key={p} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => start(p)} sx={{ minWidth: 140 }}>
                      {p}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Eating started {dayjs(settings.eatingStartAt!).format('MMM D, HH:mm')}
              </Typography>
            </>
          ) : (
            <Grid container spacing={1.5} justifyContent="center">
              {(['16/8', '20/4'] as const).map(p => (
                <Grid item xs={6} key={p} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => start(p)} sx={{ minWidth: 140 }}>
                    {p}
                  </Button>
                </Grid>
              ))}
            </Grid>
          )}
        </GlassCard>

        {/* Stages */}
        <GlassCard title="Stages" defaultExpanded>
          <PhaseList hours={hours} />
        </GlassCard>

        {/* Stats */}
        <GlassCard title="Stats" defaultExpanded right={<HistoryIcon fontSize="small" />}>
          <StreakCard count={streak} />
          <Box sx={{ mt: 1 }}>
            <HistoryBarChart data={historyData} />
          </Box>
        </GlassCard>

        {/* History */}
        <GlassCard title="History" defaultExpanded>
          <PastFastsList />
        </GlassCard>
      </Container>

      {/* Settings */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Default plan"
              value={settings.defaultPlan}
              onChange={e => updateSettings({ defaultPlan: e.target.value as any })}
              helperText="e.g. 16/8 or 20/4"
            />
            <TextField
              label="Default target hours"
              type="number"
              value={settings.defaultTargetHours}
              onChange={e => updateSettings({ defaultTargetHours: Number(e.target.value) })}
              inputProps={{ min: 1, max: 48 }}
            />
            <FormControlLabel
              control={<Switch checked={settings.use24h} onChange={e => updateSettings({ use24h: e.target.checked })} />}
              label="24-hour clock"
            />
            <Typography variant="body2" color="text.secondary">
              Data lives on your device (IndexedDB). Use “Export” to back up or move to another phone.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Import */}
      <Dialog open={openImport} onClose={() => setOpenImport(false)} fullWidth>
        <DialogTitle>Import from JSON</DialogTitle>
        <DialogContent dividers>
          <TextField label="Paste JSON here" multiline minRows={6} fullWidth value={importText} onChange={e => setImportText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImport(false)}>Cancel</Button>
          <Button onClick={async () => { await importJson(importText); setOpenImport(false); }}>Import</Button>
        </DialogActions>
      </Dialog>

      {/* Edit start */}
      <Dialog open={openEditStart} onClose={() => setOpenEditStart(false)} fullWidth>
        <DialogTitle>Edit start time</DialogTitle>
        <DialogContent dividers>
          <TextField
            type="datetime-local"
            fullWidth
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            helperText="Set when this fast actually started (local time). Future times are not allowed."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditStart(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
