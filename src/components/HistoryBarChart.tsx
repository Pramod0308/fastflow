
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function HistoryBarChart({ data }: { data: { name: string; hours: number }[] }) {
  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="name" />
          <YAxis width={24} allowDecimals={false} />
          <Tooltip formatter={(v: any) => `${v} h`} />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
