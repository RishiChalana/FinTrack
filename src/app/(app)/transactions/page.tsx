"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api-client";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState("EXPENSE");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));

  async function load() {
    const data = await apiGet<{ transactions: any[] }>("/api/transactions");
    setTransactions(data.transactions ?? []);
  }

  useEffect(() => { load(); }, []);

  async function createTxn(e: React.FormEvent) {
    e.preventDefault();
    // find or create default account
    const accs = await apiGet<{ accounts: any[] }>("/api/accounts").catch(() => ({ accounts: [] }));
    let accountId = accs.accounts?.[0]?.id;
    if (!accountId) {
      const created = await apiPost<{ account: any }>("/api/accounts", { name: "Wallet", type: "CASH", currency: "INR", startingBalance: "0" });
      accountId = created.account.id;
    }
    await apiPost("/api/transactions", {
      accountId,
      type,
      amount,
      currency: "INR",
      method,
      notes,
      date: new Date(date).toISOString(),
    });
    setAmount("0"); setNotes("");
    await load();
  }

  async function remove(id: string) {
    await apiDelete(`/api/transactions/${id}`);
    await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={createTxn} className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <select className="border rounded px-2 py-1" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="border rounded px-2 py-1" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <input type="datetime-local" className="border rounded px-2 py-1" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="bg-black text-white rounded px-3 py-1">Add</button>
        </form>
        <div className="divide-y">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">{t.notes || 'Transaction'}</div>
                <div className="text-sm text-muted-foreground">{t.type} • {t.method} • {t.currency} • {t.amount}</div>
              </div>
              <button onClick={() => remove(t.id)} className="text-red-600">Delete</button>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-sm text-muted-foreground py-4">No transactions yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
