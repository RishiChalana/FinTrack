"use client";

import { useState } from "react";

type Msg = { role: 'user' | 'assistant'; content: string };

export function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const hasToken = typeof window !== 'undefined' ? Boolean(localStorage.getItem('accessToken')) : false;

  async function send() {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput("");
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      const text = data.response || data.error || 'Sorry, I could not answer that.';
      setMessages((m) => [...m, { role: 'assistant', content: text }]);
    } finally {
      setLoading(false);
    }
  }

  async function downloadInternal(url: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    if (!res.ok) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Failed to download (unauthorized?). Please login and try again.' }]);
      return;
    }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = url.includes('type=pdf') ? 'report.pdf' : 'report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!hasToken && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
          Unauthorized. Please <a className="underline" href="/login">log in</a> to use the assistant.
        </div>
      )}
      <div className="border rounded p-3 h-80 overflow-auto bg-background">
        {messages.length === 0 && <div className="text-sm text-muted-foreground">Ask things like "Show my food expenses for this month" or "Create a new budget for groceries".</div>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-3 py-2 rounded my-1 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {m.content.split(/(https?:\/\/\S+|\/api\/\S+)/g).map((part, idx) => {
                if (/^(https?:\/\/)/.test(part)) {
                  return <a key={idx} href={part} className="underline" target="_blank" rel="noreferrer">{part}</a>;
                }
                if (/^(\/api\/)/.test(part)) {
                  return <button key={idx} className="underline" onClick={() => downloadInternal(part)}>Download</button>;
                }
                return <span key={idx}>{part}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" placeholder="Type your question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} />
        <button disabled={loading} onClick={send} className="bg-black text-white rounded px-3 py-2">Send</button>
      </div>
    </div>
  );
}


