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

export default function HistoryBarChart({
  data,
  showLines = [16, 20],
}: {
  data: Point[];
  showLines?: number[];
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Ensure the chart always shows at least up to 24h, but expands if needed
  const yMax = useMemo(() => {
    const max = Math.max(24, ...data.map((d) => d.hours));
    // round up to nearest 2
    return Math.ceil((max + 1) / 2) * 2;
  }, [data]);

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 4, bottom: 12 }}
          onMouseLeave={() => setActiveIdx(null)}
        >
          {/* Subtle grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,.08)" />

          <defs>
            {/* gradient for bars */}
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#26C6DA" />
              <stop offset="100%" stopColor="#00897B" />
            </linearGradient>
            {/* glow for active bar */}
            <filter id="barGlow" x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Axes */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={28}
            domain={[0, yMax]}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Goal lines */}
          {showLines.map((y, i) => (
            <ReferenceLine
              key={y}
              y={y}
              stroke={i === 0 ? 'rgba(0,137,123,.55)' : 'rgba(255,112,67,.7)'}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: `${y}h`,
                position: 'right',
                fill: i === 0 ? 'rgba(0,137,123,.9)' : 'rgba(255,112,67,.95)',
                fontSize: 12,
                style: { fontWeight: 800 },
              }}
            />
          ))}

          {/* Tooltip */}
          <Tooltip cursor={{ fill: 'rgba(0,0,0,.05)' }} content={<FancyTooltip />} />

          {/* Bars */}
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
