'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatPrice } from '@/lib/utils';

export function CollaboratorChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>;
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1B1F3B] text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
          <p className="font-bold text-orange-300">{label}</p>
          <p>CA Généré : <span className="font-semibold">{formatPrice(payload[0]?.value || 0)}</span></p>
          <p>Commission : <span className="font-semibold text-orange-400">{formatPrice(payload[1]?.value || 0)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748B' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748B' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={customTooltip} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 16, fontSize: 11 }}
          />
          <Bar dataKey="revenue" name="Chiffre d'affaires" fill="#1B1F3B" radius={[6, 6, 0, 0]} />
          <Bar dataKey="commission" name="Commissions" fill="#E8621A" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
