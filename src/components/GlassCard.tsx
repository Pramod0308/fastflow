import React, { useState, useRef, useLayoutEffect } from 'react';
import { Card, CardContent, Collapse, IconButton, Stack, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  right?: React.ReactNode;
};

export default function GlassCard({ title, children, defaultExpanded = true, right }: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const rightRef = useRef<HTMLDivElement>(null);
  const [rightW, setRightW] = useState(40);

  useLayoutEffect(() => {
    setRightW(rightRef.current?.getBoundingClientRect().width ?? 40);
  }, [right]);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        mb: 2,
        bgcolor: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(14px) saturate(120%)',
      }}
    >
      <Box sx={{ position: 'relative', px: 2, py: 1.5, minHeight: 52 }}>
        {/* left spacer to keep title perfectly centered */}
        <Box sx={{ position: 'absolute', left: 8, top: 8, width: rightW, height: 36 }} />
        {/* centered, stylized title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 900,
            textAlign: 'center',
            letterSpacing: 0.5,
            background: 'linear-gradient(90deg,#00897B,#26C6DA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            userSelect: 'none',
          }}
        >
          {title}
        </Typography>
        {/* right controls */}
        <Stack
          ref={rightRef}
          direction="row"
          gap={1}
          alignItems="center"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          {right}
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s transform' }}
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>{children}</CardContent>
      </Collapse>
    </Card>
  );
}
