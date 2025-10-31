"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    apiGet<{ transactions: any[] }>("/api/transactions")
      .then((d) => {
        if (mounted) setTransactions(d.transactions ?? []);
      })
      .catch(() => setTransactions([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your recent income and expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 5).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.notes || "Transaction"}</div>
                  <div className="text-sm text-muted-foreground md:inline">
                    {transaction.method || transaction.accountId}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.categoryId ? transaction.categoryId : "Other"}</Badge>
                </TableCell>
                <TableCell className={cn("text-right", transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600')}>
                  {transaction.type === 'INCOME' ? '+' : '-'}${Number(Math.abs(transaction.amount)).toFixed(2)}
                </TableCell>
                 <TableCell className="hidden sm:table-cell">{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
