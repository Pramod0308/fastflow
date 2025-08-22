import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

export type EditFastPayload = { startAt: number; endAt: number };

export default function EditFastDialog({
  open, onClose, onSave, initialStart, initialEnd
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: EditFastPayload) => void;
  initialStart: number;
  initialEnd: number;
}) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStart(dayjs(initialStart).format('YYYY-MM-DDTHH:mm'));
      setEnd(dayjs(initialEnd).format('YYYY-MM-DDTHH:mm'));
      setError(null);
    }
  }, [open, initialStart, initialEnd]);

  const handleSave = () => {
    const s = dayjs(start).valueOf();
    const e = dayjs(end).valueOf();
    const now = Date.now();
    if (e < s) return setError('End time must be after start time.');
    if (s > now || e > now) return setError('Times in the future are not allowed.');
    onSave({ startAt: s, endAt: e });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit fast</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField label="Start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
          <TextField label="End" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
