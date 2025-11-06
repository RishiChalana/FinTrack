"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Landmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api-client";

export function BalanceCards() {
  const [transactions, setTransactions] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = () => {
      apiGet<{ transactions: any[] }>("/api/transactions")
        .then((d) => { if (mounted) setTransactions(d.transactions ?? []); })
        .catch(() => setTransactions([]));
    };
    load();
    const onUpdated = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('data-updated', onUpdated);
    }
    return () => { mounted = false; if (typeof window !== 'undefined') window.removeEventListener('data-updated', onUpdated); };
  }, []);

  const totalIncome = useMemo(() =>
    transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );
  const totalExpenses = useMemo(() =>
    transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
    [transactions]
  );
  const totalBalance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">+${totalIncome.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">-${totalExpenses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );
}
