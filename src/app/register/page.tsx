"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) throw new Error("register failed");
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('data-updated'));
      }
      router.push("/dashboard");
    } catch (e) {
      alert("Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2c2c2c] to-black">
  <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
    <h1 className="text-2xl font-semibold mb-6 text-center text-white">Register</h1>
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        className="w-full bg-transparent border border-white/30 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full bg-transparent border border-white/30 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full bg-transparent border border-white/30 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        disabled={loading}
        className="w-full bg-white text-black rounded-lg px-4 py-3 hover:bg-gray-200 transition font-medium"
      >
        {loading ? '...' : 'Create account'}
      </button>
    </form>
    <div className="mt-3 text-sm text-gray-300 text-center">
      Have an account? <a className="underline" href="/login">Sign in</a>
    </div>
    <div className="mt-3 text-xs text-gray-400 flex justify-center space-x-3">
      <a className="underline" href="/terms">Terms of Service</a>
      <a className="underline" href="/privacy">Privacy Policy</a>
    </div>
  </div>
</div>

  );
}


