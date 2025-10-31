"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("0");
  const [currency, setCurrency] = useState("INR");
  const [targetDate, setTargetDate] = useState<string>("");

  async function load() {
    // Goals API not added; emulate via transactions sum toward a pseudo-goal? For now, store via budgets table? Skip.
    // We'll maintain UI shell guiding that goals backend is pending.
    setGoals([]);
  }
  useEffect(() => { load(); }, []);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    alert('Goals backend not yet wired. I can add CRUD endpoints if you want.');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={createGoal} className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <input type="date" className="border rounded px-2 py-1" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <button className="bg-black text-white rounded px-3 py-1">Add</button>
        </form>
        <div className="text-sm text-muted-foreground">Goals backend endpoints can be added next.</div>
      </CardContent>
    </Card>
  );
}
