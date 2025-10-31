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
import { transactions } from "@/lib/data";

const chartData = transactions
  .filter((t) => t.type === 'Expense')
  .reduce((acc, t) => {
    const existing = acc.find((item) => item.category === t.category);
    if (existing) {
      existing.amount += Math.abs(t.amount);
    } else {
      acc.push({ category: t.category, amount: Math.abs(t.amount) });
    }
    return acc;
  }, [] as { category: string, amount: number }[])
  .map(item => ({...item, fill: `hsl(var(--chart-${Math.floor(Math.random() * 2) + 1}))`}));


const chartConfig = {
  amount: {
    label: "Amount",
  },
  ...chartData.reduce((acc, item) => {
    acc[item.category] = { label: item.category };
    return acc;
  }, {} as any)
};

export function SpendingChart() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeCategory = chartData[activeIndex]?.category;
  const activeAmount = chartData[activeIndex]?.amount;
  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, []);

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
