export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
}

export interface DataPoint {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyData extends DataPoint {
  monthKey: string;
  weeks: DataPoint[];
}
