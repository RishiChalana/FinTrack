"use client";

import * as React from "react";
import { Pie, PieChart, Sector, TooltipProps, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api-client";

type Transaction = { type: 'INCOME' | 'EXPENSE' | 'TRANSFER'; amount: any; category?: { name?: string | null } | null; notes?: string | null };

function buildExpenseChartData(transactions: Transaction[]) {
  const expenseOnly = transactions.filter((t) => t.type === 'EXPENSE');
  const grouped: Record<string, number> = {};
  for (const t of expenseOnly) {
    const key = ((t.category?.name && t.category?.name.trim()) || (t.notes && t.notes.trim()) || 'Other') as string;
    grouped[key] = (grouped[key] || 0) + Math.abs(Number(t.amount));
  }
  const entries = Object.entries(grouped).map(([category, amount], idx) => ({
    category,
    amount,
    fill: `hsl(var(--chart-${(idx % 5) + 1}))`,
  }));
  return entries.sort((a, b) => b.amount - a.amount);
}


function useExpenseChart() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = () => {
      apiGet<{ transactions: any[] }>("/api/transactions")
        .then((d) => { if (mounted) setTxns(d.transactions ?? []); })
        .catch(() => setTxns([]));
    };
    load();
    const onUpdated = () => load();
    if (typeof window !== 'undefined') window.addEventListener('data-updated', onUpdated);
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') window.removeEventListener('data-updated', onUpdated);
    };
  }, []);
  const chartData = useMemo(() => buildExpenseChartData(txns), [txns]);
  const totalExpenses = useMemo(() => chartData.reduce((s, c) => s + c.amount, 0), [chartData]);
  return { chartData, totalExpenses };
}

export function SpendingChart() {
  const { chartData, totalExpenses } = useExpenseChart();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeCategory = chartData[activeIndex]?.category;
  const activeAmount = chartData[activeIndex]?.amount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>Your total expenses by category.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <ChartTooltip cursor={false} content={
              ({ active, payload }: TooltipProps<number, string>) => {
                if (!active || !payload || payload.length === 0) return null;
                const d: any = payload[0].payload;
                const amt = Number(d.amount) || 0;
                const pct = totalExpenses ? ((amt / totalExpenses) * 100).toFixed(1) : '0.0';
                return (
                  <div className="rounded-md border bg-white/95 p-3 shadow-lg text-sm min-w-[200px]">
                    <div className="font-semibold text-gray-900 mb-1">{d.category}</div>
                    <div className="text-gray-700 text-base">${amt.toFixed(2)}</div>
                    <div className="text-gray-500">{pct}% of total</div>
                  </div>
                );
              }
            } />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={(props) => (
                <Sector {...props} cornerRadius={5} />
              )}
              label={false}
              labelLine={false}
              onMouseOver={(_, index) => setActiveIndex(index)}
            />
          </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col items-center justify-center gap-1 text-center -mt-16">
            <p className="text-lg font-medium">{activeCategory || 'Total Expenses'}</p>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">by category</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
