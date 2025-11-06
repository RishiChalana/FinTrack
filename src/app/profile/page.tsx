"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { name?: string | null; email?: string | null } | null;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPhone(localStorage.getItem("profile:phone") || "");
    setAddress(localStorage.getItem("profile:address") || "");
    setBankName(localStorage.getItem("profile:bankName") || "");
  }, []);

  function saveProfile() {
    setSaving(true);
    try {
      localStorage.setItem("profile:phone", phone);
      localStorage.setItem("profile:address", address);
      localStorage.setItem("profile:bankName", bankName);
      // small UX pause to show saving state
      setTimeout(() => setSaving(false), 400);
    } catch (e) {
      setSaving(false);
      console.error(e);
      alert("Failed to save profile locally");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background flex items-center justify-center p-6">
  <div className="w-full max-w-2xl bg-card rounded-2xl shadow-md p-8 transition-all hover:shadow-lg">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-semibold text-foreground">Your Profile</h1>
      <button
        onClick={() => router.push("/dashboard")}
        className="rounded-lg border border-muted-foreground/20 bg-muted/40 hover:bg-muted/60 px-4 py-2 text-sm font-medium text-foreground transition"
      >
        ← Back to Dashboard
      </button>
    </div>

    <div className="space-y-6">
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Name</label>
        <div className="text-lg font-medium bg-muted/20 px-3 py-2 rounded-md border border-muted">
          {user?.name || "-"}
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Email</label>
        <div className="text-sm bg-muted/20 px-3 py-2 rounded-md border border-muted">
          {user?.email || "-"}
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Phone number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:ring-2 focus:ring-primary/70 focus:outline-none transition"
          placeholder="e.g. +1 555 123 4567"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:ring-2 focus:ring-primary/70 focus:outline-none transition"
          placeholder="Street, City, State, ZIP"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1">Bank name</label>
        <input
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:ring-2 focus:ring-primary/70 focus:outline-none transition"
          placeholder="Your primary bank"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 px-5 py-2.5 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setPhone(localStorage.getItem("profile:phone") || "");
            setAddress(localStorage.getItem("profile:address") || "");
            setBankName(localStorage.getItem("profile:bankName") || "");
          }}
          className="text-sm text-muted-foreground underline hover:text-foreground transition"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</div>


  );
}
