"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("0");
  const [period, setPeriod] = useState("MONTHLY");
  const [currency, setCurrency] = useState("INR");

  async function load() {
    const data = await apiGet<{ budgets: any[] }>("/api/budgets");
    setBudgets(data.budgets ?? []);
  }
  useEffect(() => { load(); }, []);

  async function createBudget(e: React.FormEvent) {
    e.preventDefault();
    await apiPost("/api/budgets", { name, amount, period, currency });
    setName(""); setAmount("0");
    await load();
  }

  async function remove(id: string) { await apiDelete(`/api/budgets/${id}`); await load(); }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={createBudget} className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="border rounded px-2 py-1" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <button className="bg-black text-white rounded px-3 py-1">Add</button>
        </form>
        <div className="divide-y">
          {budgets.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-sm text-muted-foreground">{b.period} • {b.currency} • {b.amount}</div>
              </div>
              <button onClick={() => remove(b.id)} className="text-red-600">Delete</button>
            </div>
          ))}
          {budgets.length === 0 && (
            <div className="text-sm text-muted-foreground py-4">No budgets yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
