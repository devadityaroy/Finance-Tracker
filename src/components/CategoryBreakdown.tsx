import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { useTheme } from './ThemeProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function CategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = isDark 
    ? ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa', '#f472b6']
    : ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

  if (data.length === 0) {
    return (
      <div className={`p-6 sm:p-8 rounded-[2.5rem] h-full flex flex-col items-center justify-center ${isDark ? 'bg-[#1a1c23]/40 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]' : 'bg-white/40 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]'} relative overflow-hidden`}>
        <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No expenses to analyze.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] h-full flex flex-col ${isDark ? 'bg-[#1a1c23]/40 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]' : 'bg-white/40 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]'} relative overflow-hidden`}>
      <h3 className="text-2xl font-bold mb-4 relative z-10 tracking-tight">Top Expenses</h3>
      <div className="flex-1 min-h-[220px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `₹${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                color: isDark ? '#f3f4f6' : '#111827',
                padding: '12px'
              }}
              itemStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontWeight: 600 }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} text-xs ml-1`}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
