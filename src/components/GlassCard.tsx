import React, { useState } from 'react';
import { Card, CardContent, Collapse, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function GlassCard({
  title, children, defaultExpanded = true, right
}: { title: string; children: React.ReactNode; defaultExpanded?: boolean; right?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultExpanded);
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        mb: 2,
        bgcolor: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(14px) saturate(120%)'
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, minHeight: 52, gap: 1 }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            flex: 1,                 // take remaining width
            lineHeight: 1.3,         // avoid clipping
            whiteSpace: 'normal',    // allow wrap
            wordBreak: 'break-word', // prevent cut-off on long words
            overflow: 'visible'
          }}
        >
          {title}
        </Typography>
        <Stack direction="row" gap={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {right}
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s transform' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
}
