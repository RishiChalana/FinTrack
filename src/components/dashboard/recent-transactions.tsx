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
import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const refresh = () => {
    apiGet<{ transactions: any[] }>("/api/transactions")
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(() => setTransactions([]));
  };

  useEffect(() => {
    let mounted = true;
    apiGet<{ transactions: any[] }>("/api/transactions")
      .then((d) => {
        if (mounted) setTransactions(d.transactions ?? []);
      })
      .catch(() => setTransactions([]));
    const handler = () => {
      refresh();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('data-updated', handler);
    }
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('data-updated', handler);
      }
    };
  }, []);

  const onUpload = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) return;
    const file = fileInputRef.current.files[0];
    const form = new FormData();
    form.append('file', file);
    setIsUploading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (res.status === 401) {
        toast({ title: 'Please log in', description: 'Your session expired. Redirecting to login.', variant: 'destructive' });
        router.push('/login');
        return;
      }
      if (!res.ok) {
        let message = 'Upload failed';
        try { const j = await res.json(); message = j.error || message; } catch {}
        throw new Error(message);
      }
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFileName("");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('data-updated'));
      }
      toast({ title: 'Import complete', description: `${data.imported || 0} transactions imported.` });
    } catch {
      toast({ title: 'Import failed', description: 'Could not import your file. Check format and try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    await onUpload();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A list of your recent income and expenses.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {fileName ? fileName : 'Choose CSV'}
            </Button>
            <Button onClick={onUpload} disabled={isUploading || !fileName}>
              {isUploading ? 'Uploading…' : 'Upload & Import'}
            </Button>
          </div>
        </div>
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
                  <Badge variant="outline">{transaction.category?.name || "Other"}</Badge>
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
