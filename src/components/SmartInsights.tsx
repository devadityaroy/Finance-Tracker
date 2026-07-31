import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { useTheme } from './ThemeProvider';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export default function SmartInsights({ transactions }: { transactions: Transaction[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const categoryTotals = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    return [
      {
        icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
        title: "Savings Rate",
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate > 20 ? 'Excellent job maintaining a healthy margin!' : 'Try to aim for a 20% margin.'}`
      },
      {
        icon: topCategory ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <Lightbulb className="w-5 h-5 text-blue-500" />,
        title: topCategory ? "Top Expense Category" : "No Expenses",
        description: topCategory 
          ? `You spend the most on ${topCategory[0]} (₹${topCategory[1].toLocaleString()}). Consider setting a strict budget here.`
          : "Add some expenses to see your personalized spending patterns."
      }
    ];
  }, [transactions]);

  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] h-full flex flex-col ${isDark ? 'bg-[#1a1c23]/40 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]' : 'bg-white/40 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]'} relative overflow-hidden`}>
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className={`p-3.5 rounded-[1.25rem] ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">AI Insights</h3>
      </div>
      <div className="flex flex-col gap-4 flex-1 justify-center relative z-10">
        {insights.map((insight, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx }}
            className={`p-5 rounded-[1.5rem] flex gap-4 items-start border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white/60 border-white/60'}`}
          >
            <div className={`mt-0.5 p-2 rounded-xl shadow-sm border ${isDark ? 'bg-black/50 border-white/10' : 'bg-white border-gray-100'}`}>
              {insight.icon}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {insight.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
