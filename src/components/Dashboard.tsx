import React, { useState, useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, Moon, Sun, Calendar, LayoutDashboard, Plus, Trash2, Edit2, X, Check, Droplets } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import InsightChart from './InsightChart';
import SmartInsights from './SmartInsights';
import CategoryBreakdown from './CategoryBreakdown';
import { initialTransactions } from '../data';
import { Transaction, MonthlyData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const [viewMode, setViewMode] = useState<'all' | 'current'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  // Category State
  const [categories, setCategories] = useState<string[]>(['Food', 'Shopping', 'Transport', 'Utilities', 'Salary', 'Freelance', 'Other']);
  const [chartCategoryFilter, setChartCategoryFilter] = useState<string>('All');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Form State
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Food');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editCategory, setEditCategory] = useState('');

  React.useEffect(() => {
    if (!isAddingCategory) {
      if (formType === 'income') setFormCategory('Salary');
      else setFormCategory('Food');
    }
  }, [formType, isAddingCategory]);

  const monthlyData = useMemo(() => {
    const monthsMap = new Map<string, MonthlyData>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = d.toLocaleString('default', { month: 'short' });
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      monthsMap.set(monthKey, {
        period, monthKey, income: 0, expense: 0, net: 0,
        weeks: [
          { period: 'Week 1', income: 0, expense: 0, net: 0 },
          { period: 'Week 2', income: 0, expense: 0, net: 0 },
          { period: 'Week 3', income: 0, expense: 0, net: 0 },
          { period: 'Week 4', income: 0, expense: 0, net: 0 },
        ]
      });
    }

    transactions.forEach(tx => {
      if (chartCategoryFilter !== 'All' && tx.category !== chartCategoryFilter) return;

      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      const monthData = monthsMap.get(monthKey);
      if (!monthData) return;

      if (tx.type === 'income') {
        monthData.income += tx.amount;
      } else {
        monthData.expense += tx.amount;
      }
      monthData.net = monthData.income - monthData.expense;

      const dateNum = d.getDate();
      let weekIdx = Math.floor((dateNum - 1) / 7);
      if (weekIdx > 3) weekIdx = 3;

      if (tx.type === 'income') {
        monthData.weeks[weekIdx].income += tx.amount;
      } else {
        monthData.weeks[weekIdx].expense += tx.amount;
      }
      monthData.weeks[weekIdx].net = monthData.weeks[weekIdx].income - monthData.weeks[weekIdx].expense;
    });

    return Array.from(monthsMap.values());
  }, [transactions, chartCategoryFilter]);

  const currentMonthData = monthlyData[monthlyData.length - 1];
  const displayData = useMemo(() => viewMode === 'all' ? monthlyData : (currentMonthData?.weeks || []), [viewMode, currentMonthData, monthlyData]);

  const summary = useMemo(() => {
    return displayData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense,
      net: acc.net + curr.net
    }), { income: 0, expense: 0, net: 0 });
  }, [displayData]);

  const isPositive = summary.net >= 0;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) return;

    let finalCategory = formCategory;
    if (isAddingCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      if (!categories.includes(finalCategory)) setCategories(prev => [...prev, finalCategory]);
    }

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: formType, amount, description: formDesc || 'New Transaction',
      date: new Date(formDate).toISOString(), category: finalCategory || 'Other'
    };

    setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setFormAmount(''); setFormDesc(''); setNewCategoryName(''); setIsAddingCategory(false); setShowTransactionForm(false);
  };

  const startEditing = (tx: Transaction) => {
    setEditingId(tx.id); setEditAmount(tx.amount.toString()); setEditDesc(tx.description);
    setEditDate(tx.date.split('T')[0]); setEditType(tx.type); setEditCategory(tx.category || 'Other');
  };

  const cancelEditing = () => setEditingId(null);

  const saveEditing = (id: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, amount, description: editDesc, date: new Date(editDate).toISOString(), type: editType, category: editCategory } : tx).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setEditingId(null);
  };

  const tableTransactions = useMemo(() => {
    let filteredTxs = [...transactions];
    if (viewMode === 'current') {
      const now = new Date();
      filteredTxs = filteredTxs.filter(tx => {
        const d = new Date(tx.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return filteredTxs;
  }, [transactions, viewMode]);

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(tx => tx.id !== id));

  const glassPanel = isDark 
    ? 'bg-[#1a1c23]/20 backdrop-blur-[64px] backdrop-saturate-[300%] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.02)]' 
    : 'bg-white/20 backdrop-blur-[64px] backdrop-saturate-[300%] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(255,255,255,0.3)]';

  const inputBase = `w-full p-3.5 rounded-2xl outline-none transition-all duration-300 backdrop-blur-xl backdrop-saturate-[150%] ${isDark ? 'bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:bg-white/[0.08] focus:border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]' : 'bg-white/30 border border-white/50 text-gray-900 placeholder:text-gray-400 focus:bg-white/60 focus:border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'}`;
  
  const selectChevron = isDark
    ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
    : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

  
  const glassButton = `p-3.5 rounded-2xl outline-none transition-all duration-300 backdrop-blur-xl backdrop-saturate-[150%] flex items-center justify-center ${isDark ? 'bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/30 border border-white/50 text-gray-900 hover:bg-white/60 hover:border-white'}`;

  return (
    <div className="min-h-screen pb-24 relative selection:bg-indigo-500/30 font-sans">
      <div className={`fixed inset-0 z-[-1] transition-colors duration-1000 overflow-hidden ${isDark ? 'bg-[#050507]' : 'bg-[#f4f6fa]'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] animate-blob">
          <div className={`w-full h-full blur-[120px] rounded-full mix-blend-multiply ${isDark ? 'mix-blend-screen opacity-20' : 'opacity-40'} animate-pulse transition-colors duration-1000 ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ animationDuration: '10s' }} />
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] animate-blob animation-delay-4000">
          <div className={`w-full h-full blur-[140px] rounded-full mix-blend-multiply ${isDark ? 'mix-blend-screen opacity-20' : 'opacity-30'} animate-pulse transition-colors duration-1000 ${isPositive ? 'bg-teal-300' : 'bg-orange-400'}`} style={{ animationDuration: '12s', animationDelay: '1s' }} />
        </div>
      </div>

      <header className={`sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-[2.5rem] backdrop-blur-[40px] backdrop-saturate-[200%] transition-colors duration-700 border overflow-hidden ${
        isDark 
          ? 'bg-[#1a1c23]/40 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]' 
          : 'bg-white/40 border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]'
      }`}>
        <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 pointer-events-none ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[64px] opacity-30 transition-colors duration-1000 pointer-events-none transform-gpu translate-z-0 ${isPositive ? 'bg-emerald-300' : 'bg-rose-400'}`} />
        
        <div className="relative z-10 px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-6 w-full lg:w-auto text-left">
             <div className="flex items-center gap-4">
               <div className={`p-3.5 rounded-[1.25rem] transition-colors duration-700 flex-shrink-0 ${isPositive ? 'bg-emerald-500 text-white shadow-[0_8px_24px_rgba(16,185,129,0.4)]' : 'bg-rose-500 text-white shadow-[0_8px_24px_rgba(244,63,94,0.4)]'}`}>
                 <Droplets className="w-6 h-6" />
               </div>
               <div className="flex flex-col justify-between h-[42px] py-0.5 text-left">
                 <p className={`text-[11px] uppercase tracking-widest font-bold opacity-70 leading-none`}>Net Balance</p>
                 <h2 className={`text-3xl font-extrabold font-mono tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br pb-0.5 ${isPositive ? (isDark ? 'from-emerald-400 to-teal-200' : 'from-emerald-600 to-teal-500') : (isDark ? 'from-rose-400 to-orange-300' : 'from-rose-600 to-orange-500')}`}>
                   {isPositive ? '+' : '-'}₹{Math.abs(summary.net).toLocaleString()}
                 </h2>
               </div>
             </div>
             
             <div className={`hidden sm:block h-12 w-px ${isDark ? 'bg-white/20' : 'bg-black/10'}`} />
             
             <div className="flex gap-6 w-full sm:w-auto justify-start">
               <div className="flex flex-col justify-between h-[42px] py-0.5 text-left">
                 <div className="flex items-center gap-1.5">
                   <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                   <p className={`text-[10px] uppercase tracking-widest font-bold opacity-70 leading-none`}>Income</p>
                 </div>
                 <p className={`text-lg font-bold font-mono tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br pb-0.5 ${isDark ? 'from-emerald-400 to-emerald-200' : 'from-emerald-600 to-emerald-400'}`}>₹{summary.income.toLocaleString()}</p>
               </div>
               <div className="flex flex-col justify-between h-[42px] py-0.5 text-left">
                 <div className="flex items-center gap-1.5">
                   <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                   <p className={`text-[10px] uppercase tracking-widest font-bold opacity-70 leading-none`}>Expenses</p>
                 </div>
                 <p className={`text-lg font-bold font-mono tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br pb-0.5 ${isDark ? 'from-rose-400 to-rose-200' : 'from-rose-600 to-rose-400'}`}>₹{summary.expense.toLocaleString()}</p>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
             <div className={`relative flex p-1.5 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/5'} shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}>
                {['current', 'all'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`relative z-10 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === mode ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}`}
                  >
                    {viewMode === mode && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute inset-0 rounded-xl border ${isDark ? 'bg-white/15 border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'bg-white border-white shadow-sm'}`}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {mode === 'current' ? <Calendar className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                      {mode === 'current' ? 'Month' : 'All'}
                    </span>
                  </button>
                ))}
             </div>

             <button
               onClick={() => setShowTransactionForm(!showTransactionForm)}
               className={`p-3.5 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] outline-none backdrop-blur-xl border shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] flex items-center justify-center ${isPositive ? 'bg-emerald-500/80 border-emerald-400/50 text-white hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-rose-500/80 border-rose-400/50 text-white hover:bg-rose-400 shadow-rose-500/20'}`}
             >
               <Plus className={`w-5 h-5 transition-transform duration-500 ${showTransactionForm ? 'rotate-[135deg]' : 'rotate-0'}`} />
             </button>

             <button 
               onClick={toggleTheme}
               className={`p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] outline-none backdrop-blur-xl border shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] flex items-center justify-center ${isDark ? 'bg-white/10 border-white/20 text-amber-300 hover:bg-white/20' : 'bg-black/5 border-black/10 text-indigo-600 hover:bg-black/10'}`}
             >
               {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        <AnimatePresence>
          {showTransactionForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
              className="overflow-hidden origin-top"
            >
              <form onSubmit={handleAddTransaction} className={`p-6 sm:p-8 rounded-[2.5rem] border ${glassPanel} relative`}>
                <h3 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  <Wallet className={`w-6 h-6 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`} />
                  Add Transaction
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
                  <div className="lg:col-span-1">
                    <label className={`block text-xs uppercase tracking-wider font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value as 'income' | 'expense')} className={`${inputBase} appearance-none cursor-pointer pr-10`} style={{ backgroundImage: selectChevron, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                      <option value="expense" className={isDark ? 'bg-gray-900' : 'bg-white'}>Expense</option>
                      <option value="income" className={isDark ? 'bg-gray-900' : 'bg-white'}>Income</option>
                    </select>
                  </div>
                  <div className="lg:col-span-1">
                    <label className={`block text-xs uppercase tracking-wider font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount</label>
                    <input type="number" required min="0.01" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" className={`${inputBase} font-mono`} />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={`block text-xs uppercase tracking-wider font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</label>
                    {isAddingCategory ? (
                      <div className="flex gap-2">
                        <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category" className={inputBase} autoFocus />
                        <button type="button" onClick={() => setIsAddingCategory(false)} className={glassButton}><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className={`${inputBase} appearance-none cursor-pointer pr-10`} style={{ backgroundImage: selectChevron, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                          {categories.map(c => <option key={c} value={c} className={isDark ? 'bg-gray-900' : 'bg-white'}>{c}</option>)}
                        </select>
                        <button type="button" onClick={() => setIsAddingCategory(true)} className={glassButton}><Plus className="w-5 h-5" /></button>
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-1">
                    <label className={`block text-xs uppercase tracking-wider font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date</label>
                    <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className={`${inputBase} appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${isDark ? '[color-scheme:dark]' : '[color-scheme:light]'}`} />
                  </div>
                  <div className="lg:col-span-1 flex flex-col justify-end">
                    <label className={`block text-xs uppercase tracking-wider font-bold mb-2 opacity-0 hidden lg:block`}>Action</label>
                    <button type="submit" className={`w-full p-3.5 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] backdrop-blur-xl outline-none border ${isPositive ? 'bg-emerald-500/90 border-emerald-400/50 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-rose-500/90 border-rose-400/50 hover:bg-rose-400 shadow-rose-500/20'}`}>Save</button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="h-full">
            <CategoryBreakdown transactions={tableTransactions} />
          </div>
          <div className="h-full">
            <SmartInsights transactions={tableTransactions} />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`p-6 sm:p-8 rounded-[2.5rem] border ${glassPanel} mb-8 relative overflow-hidden`}
        >
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                {viewMode === 'all' ? '6-Month Overview' : `${currentMonthData?.period || ''} Trends`}
              </h3>
            </div>
            <div>
              <select
                value={chartCategoryFilter}
                onChange={(e) => setChartCategoryFilter(e.target.value)}
                className={`px-5 py-2.5 rounded-2xl text-sm border font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors ${isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-white/70 border-gray-200 text-gray-900'}`}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="h-[420px] w-full relative z-10">
            <InsightChart data={displayData} />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`rounded-[2.5rem] border overflow-hidden ${glassPanel} mb-12`}
        >
          <div className={`p-6 sm:p-8 border-b ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
            <h3 className="text-2xl font-bold tracking-tight">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'bg-black/20 text-gray-400' : 'bg-gray-50/50 text-gray-500'}`}>
                <tr>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Description</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5 text-right">Amount</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-200/50'}`}>
                {tableTransactions.map((tx, index) => {
                  const d = new Date(tx.date);
                  const monthName = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
                  let showMonthHeader = false;
                  if (viewMode === 'all') {
                    if (index === 0) showMonthHeader = true;
                    else if (monthName !== new Date(tableTransactions[index - 1].date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })) showMonthHeader = true;
                  }

                  return (
                    <React.Fragment key={tx.id}>
                      {showMonthHeader && (
                        <tr className={`${isDark ? 'bg-black/30' : 'bg-indigo-50/30'}`}>
                          <td colSpan={6} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest ${isPositive ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}`}>
                            {monthName}
                          </td>
                        </tr>
                      )}
                      <tr className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-white/60'}`}>
                        {editingId === tx.id ? (
                          <>
                            <td className="px-6 py-4"><input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={`w-full p-2.5 rounded-xl border text-sm ${isDark ? 'bg-black/50 border-white/20' : 'bg-white border-gray-300'}`} /></td>
                            <td className="px-6 py-4"><input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className={`w-full p-2.5 rounded-xl border text-sm ${isDark ? 'bg-black/50 border-white/20' : 'bg-white border-gray-300'}`} /></td>
                            <td className="px-6 py-4">
                              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={`w-full p-2.5 rounded-xl border text-sm ${isDark ? 'bg-black/50 border-white/20' : 'bg-white border-gray-300'}`}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <select value={editType} onChange={(e) => setEditType(e.target.value as 'income' | 'expense')} className={`w-full p-2.5 rounded-xl border text-sm ${isDark ? 'bg-black/50 border-white/20' : 'bg-white border-gray-300'}`}>
                                <option value="expense">Expense</option><option value="income">Income</option>
                              </select>
                            </td>
                            <td className="px-6 py-4"><input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={`w-full p-2.5 rounded-xl border text-sm text-right ${isDark ? 'bg-black/50 border-white/20' : 'bg-white border-gray-300'}`} /></td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => saveEditing(tx.id)} className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"><Check className="w-4 h-4" /></button>
                                <button onClick={cancelEditing} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}><X className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className={`px-6 py-5 whitespace-nowrap font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-5 font-bold text-base tracking-tight">{tx.description}</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-black/5 border-black/10 text-gray-700'}`}>
                                {tx.category}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${tx.type === 'income' ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200') : (isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-100 text-rose-700 border-rose-200')}`}>
                                {tx.type === 'income' ? 'Income' : 'Expense'}
                              </span>
                            </td>
                            <td className={`px-6 py-5 text-right font-mono font-bold text-lg ${tx.type === 'income' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}`}>
                              {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditing(tx)} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-gray-900'}`}><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteTransaction(tx.id)} className={`p-2.5 rounded-xl transition-colors hover:bg-rose-500/20 text-rose-500`}><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    </React.Fragment>
                  );
                })}
                {tableTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                          <Wallet className="w-12 h-12 opacity-50" />
                        </div>
                        <p className="font-medium text-lg">No transactions found for this period.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
