import { Transaction } from './types';

const generateMockTransactions = (): Transaction[] => {
  const txs: Transaction[] = [];
  const now = new Date();
  
  const expenseCategories = ['Food', 'Shopping', 'Transport', 'Utilities'];
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Generate salary income
    txs.push({
      id: `inc-${i}-1`,
      type: 'income',
      amount: 4500 + Math.floor(Math.random() * 1500),
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString(),
      description: 'Salary',
      category: 'Salary'
    });
    
    // Generate side hustle income
    txs.push({
      id: `inc-${i}-2`,
      type: 'income',
      amount: 500 + Math.floor(Math.random() * 800),
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString(),
      description: 'Freelance',
      category: 'Freelance'
    });
    
    // Generate expenses
    for (let j = 1; j <= 8; j++) {
      txs.push({
        id: `exp-${i}-${j}`,
        type: 'expense',
        amount: 200 + Math.floor(Math.random() * 600),
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 2 + j * 3).toISOString(),
        description: `Expense ${j}`,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
      });
    }
  }
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const initialTransactions = generateMockTransactions();
