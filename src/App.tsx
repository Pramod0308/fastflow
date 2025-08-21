
import React, { useEffect, useMemo, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Button, IconButton, Menu, MenuItem,
  Stack, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerRing from './components/TimerRing';
import PhaseList from './components/PhaseList';
import HistoryBarChart from './components/HistoryBarChart';
import StreakCard from './components/StreakCard';
import { useStore } from './state/store';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { last7DaysBuckets, msToH, prettyHms, computeStreak } from './lib/stats';

dayjs.extend(duration);

const PLAN_TO_HOURS: Record<string, number> = { '16/8': 16, '18/6': 18, '20/4': 20, 'OMAD': 23, 'Custom': 16 };

export default function App() {
  const { hydrated, init, fasts, current, startFast, endFast, cancelFast, settings, updateSettings, exportJson, importJson } = useStore();

  useEffect(() => { init(); }, [init]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedMs = current ? now - current.startAt : 0;
  const elapsedText = prettyHms(elapsedMs);
  const targetHours = current?.targetHours ?? settings.defaultTargetHours;
  const hours = msToH(elapsedMs);

  const historyData = useMemo(() => last7DaysBuckets(fasts), [fasts]);
  const streak = useMemo(() => computeStreak(fasts, 12), [fasts]);

  // Menus & dialogs
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  const [openSettings, setOpenSettings] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importText, setImportText] = useState('');

  if (!hydrated) return null;

  const start = (plan: string) => {
    const hours = PLAN_TO_HOURS[plan] ?? settings.defaultTargetHours;
    startFast(hours, plan);
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
        <Card sx={{ borderRadius: 4, mb: 2, overflow: 'hidden' }}>
          <CardContent sx={{ display: 'grid', placeItems: 'center', pt: 3 }}>
            <Box sx={{ color: 'primary.main', position: 'relative' }}>
              <TimerRing elapsedMs={elapsedMs} targetHours={targetHours} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Elapsed time</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{current ? elapsedText : '00:00:00'}</Typography>
                <Chip size="small" label={`${targetHours}h target`} sx={{ mt: 1 }} />
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {!current && (
                <>
                  {(['16/8','18/6','20/4','OMAD'] as const).map(p =>
                    <Button key={p} variant="contained" startIcon={<PlayArrowIcon />} onClick={() => start(p)}>
                      {p}
                    </Button>
                  )}
                </>
              )}
              {current && (
                <>
                  <Button color="error" variant="outlined" startIcon={<StopIcon />} onClick={() => cancelFast()}>
                    Cancel
                  </Button>
                  <Button variant="contained" startIcon={<StopIcon />} onClick={() => endFast()}>
                    End Fast
                  </Button>
                </>
              )}
            </Stack>
            {current && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Started {dayjs(current.startAt).format('MMM D, HH:mm')}</Typography>}
          </CardContent>
        </Card>

        {/* Phases */}
        <PhaseList hours={hours} />

        {/* Stats */}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <StreakCard count={streak} />
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <HistoryIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Last 7 days</Typography>
              </Stack>
              <HistoryBarChart data={historyData} />
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* Settings dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Default plan"
              value={settings.defaultPlan}
              onChange={e => updateSettings({ defaultPlan: e.target.value as any })}
              helperText="e.g. 16/8, 18/6, 20/4, OMAD"
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

      {/* Import dialog */}
      <Dialog open={openImport} onClose={() => setOpenImport(false)} fullWidth>
        <DialogTitle>Import from JSON</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Paste JSON here"
            multiline minRows={6} fullWidth
            value={importText}
            onChange={e => setImportText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImport(false)}>Cancel</Button>
          <Button onClick={async () => { await importJson(importText); setOpenImport(false); }}>Import</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
