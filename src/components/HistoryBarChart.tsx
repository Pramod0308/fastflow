import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Rectangle,
} from 'recharts';

type Point = { name: string; hours: number };

function FancyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: '8px 10px',
        borderRadius: 12,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{val.toFixed(1)} h</div>
    </div>
  );
}

// Robust custom SVG label for reference lines
const GoalLabel = ({ viewBox, text, color }: any) => {
  if (!viewBox) return null;
  const { x = 0, width = 0, y = 0 } = viewBox;
  return (
    <text
      x={x + width + 6}
      y={y}
      dy="0.35em"
      fill={color}
      fontWeight={800}
      fontSize={12}
    >
      {text}
    </text>
  );
};

export default function HistoryBarChart({ data }: { data: Point[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const yMax = useMemo(() => {
    const max = Math.max(24, ...data.map((d) => d.hours));
    return Math.ceil((max + 1) / 2) * 2; // round up to even
  }, [data]);

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 18, left: 4, bottom: 12 }}
          onMouseLeave={() => setActiveIdx(null)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,.08)" />

          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#26C6DA" />
              <stop offset="100%" stopColor="#00897B" />
            </linearGradient>
            <filter id="barGlow" x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          {/* Hide Y axis labels entirely */}
          <YAxis hide domain={[0, yMax]} />

          {/* 16h line + text label */}
          <ReferenceLine
            y={16}
            stroke="rgba(0,137,123,.55)"
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
            label={<GoalLabel text="16h" color="rgba(0,137,123,.9)" />}
          />
          {/* 20h line + text label */}
          <ReferenceLine
            y={20}
            stroke="rgba(255,112,67,.7)"
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
            label={<GoalLabel text="20h" color="rgba(255,112,67,.95)" />}
          />

          <Tooltip cursor={{ fill: 'rgba(0,0,0,.05)' }} content={<FancyTooltip />} />

          <Bar
            dataKey="hours"
            fill="url(#barGrad)"
            radius={[10, 10, 10, 10]}
            maxBarSize={36}
            onMouseEnter={(_, idx) => setActiveIdx(idx)}
            activeBar={<Rectangle radius={[10, 10, 10, 10]} filter="url(#barGlow)" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
