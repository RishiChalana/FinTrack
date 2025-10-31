export type Account = {
  id: string;
  name: string;
  type: 'Bank' | 'Cash' | 'Credit Card';
  balance: number;
  currency: 'USD';
};

export const accounts: Account[] = [];

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
  accountName: string;
};

export const transactions: Transaction[] = [];

export type Budget = {
    id: string;
    name: string;
    category: string;
    limit: number;
    spent: number;
};

export const budgets: Budget[] = [];
