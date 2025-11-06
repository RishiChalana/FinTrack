"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api-client";

export function BudgetStatus() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      Promise.all([
        apiGet<{ budgets: any[] }>("/api/budgets").catch(() => ({ budgets: [] })),
        apiGet<{ transactions: any[] }>("/api/transactions").catch(() => ({ transactions: [] })),
      ]).then(([b, t]) => {
        if (!mounted) return;
        setBudgets(b.budgets ?? []);
        setTransactions(t.transactions ?? []);
      });
    };
    load();
    const onUpdated = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('data-updated', onUpdated);
    }
    return () => { mounted = false; };
  }, []);

  const spentByBudgetId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of budgets) {
      // Sum expenses where the merchant (stored in notes) matches the budget name
      const budgetName = (b.name || '').toString().trim().toLowerCase();
      const spent = transactions
        .filter((tx) => tx.type === 'EXPENSE')
        .filter((tx) => {
          const merchant = (tx.notes || '').toString().trim().toLowerCase();
          return budgetName.length > 0 && merchant === budgetName;
        })
        .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
      map[b.id] = spent;
    }
    return map;
  }, [budgets, transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
        <CardDescription>Your spending progress for this month's budgets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const spent = spentByBudgetId[budget.id] ?? 0;
          const progress = budget.amount ? (spent / Number(budget.amount)) * 100 : 0;
          return (
            <div key={budget.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{budget.name}</span>
                <span className="text-sm text-muted-foreground">
                  ${spent.toFixed(2)} / ${Number(budget.amount).toFixed(2)}
                </span>
              </div>
              <Progress value={progress} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
