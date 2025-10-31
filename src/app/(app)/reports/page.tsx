"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function download(type: 'csv' | 'pdf') {
    const params = new URLSearchParams();
    if (start) params.set('start', new Date(start).toISOString());
    if (end) params.set('end', new Date(end).toISOString());
    params.set('type', type);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const url = `/api/reports/export?${params.toString()}`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(async (res) => {
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = type === 'csv' ? 'report.csv' : 'report.pdf';
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="datetime-local" className="border rounded px-2 py-1" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="datetime-local" className="border rounded px-2 py-1" value={end} onChange={(e) => setEnd(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => download('csv')} className="bg-black text-white rounded px-3 py-1">Export CSV</button>
            <button onClick={() => download('pdf')} className="bg-black text-white rounded px-3 py-1">Export PDF</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
