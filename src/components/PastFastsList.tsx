import React, { useMemo, useState } from 'react';
import { Chip, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';
import { useStore } from '../state/store';
import EditFastDialog from './EditFastDialog';

export default function PastFastsList() {
  const { fasts, updateFastTimes } = useStore();
  const [editing, setEditing] = useState<{ id: string; startAt: number; endAt: number } | null>(null);
  const past = useMemo(() => fasts.filter(f => f.endAt).sort((a,b) => (b.endAt! - a.endAt!)).slice(0, 50), [fasts]);

  return (
    <>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>History (edit previous fasts)</Typography>
        <Chip size="small" label={`${past.length}`} />
      </Stack>
      <List dense>
        {past.map(f => {
          const durH = ((f.endAt! - f.startAt) / 3600000).toFixed(1);
          return (
            <ListItem
              key={f.id}
              secondaryAction={
                <IconButton edge="end" aria-label="edit" onClick={() => setEditing({ id: f.id, startAt: f.startAt, endAt: f.endAt! })}>
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${dayjs(f.startAt).format('MMM D, HH:mm')} → ${dayjs(f.endAt!).format('MMM D, HH:mm')}`}
                secondary={`${durH}h • ${f.plan}`}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
          );
        })}
        {past.length === 0 && <Typography variant="body2" color="text.secondary">No past fasts yet.</Typography>}
      </List>

      {editing && (
        <EditFastDialog
          open
          initialStart={editing.startAt}
          initialEnd={editing.endAt}
          onClose={() => setEditing(null)}
          onSave={({ startAt, endAt }) => { updateFastTimes(editing.id, startAt, endAt); setEditing(null); }}
        />
      )}
    </>
  );
}
