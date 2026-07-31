import React from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { DataPoint } from '../types';
import { useTheme } from './ThemeProvider';

interface InsightChartProps {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isDark = document.documentElement.classList.contains('dark');
    return (
      <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
        isDark ? 'bg-gray-900/90 border-gray-700/50 text-white' : 'bg-white/90 border-gray-200/50 text-gray-900'
      }`}>
        <p className="font-semibold mb-3 tracking-tight">{label}</p>
        {payload.map((entry: any, index: number) => {
          // Adjust color for gradients in tooltip
          let dotColor = entry.color;
          if (entry.dataKey === 'income') dotColor = isDark ? '#10b981' : '#059669';
          if (entry.dataKey === 'expense') dotColor = isDark ? '#ef4444' : '#dc2626';
          if (entry.dataKey === 'net') dotColor = entry.value >= 0 ? (isDark ? '#10b981' : '#059669') : (isDark ? '#ef4444' : '#dc2626');
          
          return (
            <div key={index} className="flex items-center gap-3 mb-1.5 last:mb-0">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-sm opacity-80">{entry.name}:</span>
              <span className="text-sm font-bold font-mono ml-auto">
                {entry.value >= 0 ? '₹' : '-₹'}{Math.abs(entry.value).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function InsightChart({ data }: InsightChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full min-h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? '#10b981' : '#059669'} stopOpacity={0.6}/>
              <stop offset="95%" stopColor={isDark ? '#10b981' : '#059669'} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? '#ef4444' : '#dc2626'} stopOpacity={0.6}/>
              <stop offset="95%" stopColor={isDark ? '#ef4444' : '#dc2626'} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="netPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#34d399' : '#10b981'} stopOpacity={1}/>
              <stop offset="100%" stopColor={isDark ? '#059669' : '#047857'} stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="netNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={1}/>
              <stop offset="100%" stopColor={isDark ? '#dc2626' : '#b91c1c'} stopOpacity={1}/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDark ? '#374151' : '#e5e7eb'} 
            opacity={0.5}
          />
          <XAxis 
            dataKey="period" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 500 }}
            tickFormatter={(value) => `₹${value >= 1000 ? value / 1000 + 'k' : value}`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#374151' : '#f3f4f6', opacity: 0.4 }} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
          />

          <Bar 
            dataKey="income" 
            name="Income" 
            fill="url(#colorIncome)" 
            radius={[6, 6, 6, 6]}
            barSize={16}
          />
          <Bar 
            dataKey="expense" 
            name="Expense" 
            fill="url(#colorExpense)" 
            radius={[6, 6, 6, 6]}
            barSize={16}
          />
          <Bar 
            dataKey="net" 
            name="Net Profit/Loss" 
            radius={[6, 6, 6, 6]} 
            barSize={24}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.net >= 0 ? 'url(#netPositive)' : 'url(#netNegative)'} 
              />
            ))}
          </Bar>
          <Line 
            type="monotone" 
            dataKey="net" 
            name="Net Trend" 
            stroke={data.length && data[data.length - 1]?.net >= 0 ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626')} 
            strokeWidth={4} 
            dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#1f2937' : '#ffffff', stroke: data.length && data[data.length - 1]?.net >= 0 ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626') }} 
            activeDot={{ r: 6, strokeWidth: 0, fill: data.length && data[data.length - 1]?.net >= 0 ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626') }} 
            filter="url(#glow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
