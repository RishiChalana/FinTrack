"use client";

import * as React from "react";
import { Pie, PieChart, Sector } from "recharts";
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

function buildChartData(transactions: any[]) {
  const expenseOnly = transactions.filter((t) => t.type === 'EXPENSE');
  const grouped: Record<string, number> = {};
  for (const t of expenseOnly) {
    const key = t.method || t.categoryId || 'Other';
    grouped[key] = (grouped[key] || 0) + Math.abs(Number(t.amount));
  }
  return Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount,
    fill: `hsl(var(--chart-${Math.floor(Math.random() * 2) + 1}))`,
  }));
}


function useTransactionsChart() {
  const [txns, setTxns] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    apiGet<{ transactions: any[] }>("/api/transactions")
      .then((d) => { if (mounted) setTxns(d.transactions ?? []); })
      .catch(() => setTxns([]));
    return () => { mounted = false; };
  }, []);
  const chartData = useMemo(() => buildChartData(txns), [txns]);
  const chartConfig = useMemo(() => ({
    amount: { label: "Amount" },
    ...chartData.reduce((acc: any, item) => {
      acc[item.category] = { label: item.category };
      return acc;
    }, {} as any)
  }), [chartData]);
  return { chartData, chartConfig };
}

export function SpendingChart() {
  const { chartData, chartConfig } = useTransactionsChart();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeCategory = chartData[activeIndex]?.category;
  const activeAmount = chartData[activeIndex]?.amount;
  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>Your expenses by category this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={(props) => (
                <Sector {...props} cornerRadius={5} />
              )}
              onMouseOver={(_, index) => setActiveIndex(index)}
            />
          </PieChart>
        </ChartContainer>
         <div className="flex flex-col items-center justify-center gap-1 text-center -mt-16">
            {activeCategory ? (
                <>
                    <p className="text-lg font-medium">{activeCategory}</p>
                    <p className="text-3xl font-bold">${activeAmount?.toFixed(2)}</p>
                </>
            ) : (
                <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
            )}
            <p className="text-sm text-muted-foreground">Total Expenses</p>
        </div>
      </CardContent>
    </Card>
  );
}
