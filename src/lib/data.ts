export type Account = {
  id: string;
  name: string;
  type: 'Bank' | 'Cash' | 'Credit Card';
  balance: number;
  currency: 'USD';
};

export const accounts: Account[] = [
  { id: '1', name: 'Main Bank Account', type: 'Bank', balance: 10500.75, currency: 'USD' },
  { id: '2', name: 'Cash Wallet', type: 'Cash', balance: 345.50, currency: 'USD' },
  { id: '3', name: 'Visa Platinum', type: 'Credit Card', balance: -1240.20, currency: 'USD' },
];

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
  accountName: string;
};

export const transactions: Transaction[] = [
  { id: '1', date: new Date().toISOString(), description: 'Monthly Salary', category: 'Salary', amount: 5000, type: 'Income', accountName: 'Main Bank Account' },
  { id: '2', date: new Date(Date.now() - 2 * 86400000).toISOString(), description: 'Grocery Shopping', category: 'Food', amount: -150.25, type: 'Expense', accountName: 'Visa Platinum' },
  { id: '3', date: new Date(Date.now() - 3 * 86400000).toISOString(), description: 'Gasoline', category: 'Transport', amount: -60.00, type: 'Expense', accountName: 'Visa Platinum' },
  { id: '4', date: new Date(Date.now() - 4 * 86400000).toISOString(), description: 'Dinner with friends', category: 'Food', amount: -85.50, type: 'Expense', accountName: 'Cash Wallet' },
  { id: '5', date: new Date(Date.now() - 5 * 86400000).toISOString(), description: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, type: 'Expense', accountName: 'Main Bank Account' },
];

export type Budget = {
    id: string;
    name: string;
    category: string;
    limit: number;
    spent: number;
};

export const budgets: Budget[] = [
    { id: '1', name: 'Food', category: 'Food', limit: 800, spent: 432.50 },
    { id: '2', name: 'Transport', category: 'Transport', limit: 300, spent: 110.70 },
    { id: '3', name: 'Entertainment', category: 'Entertainment', limit: 250, spent: 180.20 },
];
