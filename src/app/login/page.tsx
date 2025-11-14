"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  function storeTokens(data: { accessToken: string; refreshToken: string }) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    window.dispatchEvent(new Event("data-updated"));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("login failed");
      const data = await res.json();
      storeTokens(data);
      router.push("/dashboard");
    } catch (e) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return;
    const handleOnLoad = () => {
      if (!(window as any).google || !googleButtonRef.current) return;
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    };

    const existing = document.getElementById("google-identity-services");
    if (existing) {
      if ((window as any).google) {
        handleOnLoad();
      } else {
        existing.addEventListener("load", handleOnLoad);
      }
      return () => {
        existing.removeEventListener?.("load", handleOnLoad);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-identity-services";
    script.onload = handleOnLoad;
    document.body.appendChild(script);
    return () => {
      script.removeEventListener?.("load", handleOnLoad);
    };
  }, []);

  async function handleGoogleCredential(response: any) {
    if (!response?.credential) return;
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) throw new Error("Google sign-in failed");
      const data = await res.json();
      storeTokens(data);
      router.push("/dashboard");
    } catch (err) {
      alert("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2c2c2c] to-black">
  <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
    <h1 className="text-2xl font-semibold mb-6 text-center text-white">Login</h1>
    <form onSubmit={onSubmit} className="space-y-4">
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
        {loading ? '...' : 'Login'}
      </button>
    </form>
    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
          <span className="flex-1 border-t border-white/20" />
          <span>Or continue with</span>
          <span className="flex-1 border-t border-white/20" />
        </div>
        <div ref={googleButtonRef} className="flex justify-center" />
        {googleLoading && (
          <p className="text-center text-xs text-gray-400">Authorizing…</p>
        )}
      </div>
    ) : (
      <p className="mt-6 text-center text-xs text-yellow-200">
        Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in.
      </p>
    )}
    <div className="mt-3 text-sm flex justify-between text-gray-300">
      <a className="underline" href="/register">Registration</a>
      <a className="underline" href="/forgot-password">Forgot password</a>
    </div>
    <div className="mt-3 text-xs text-gray-400 flex justify-center space-x-3">
      <a className="underline" href="/terms">Terms of Service</a>
      <a className="underline" href="/privacy">Privacy Policy</a>
    </div>
  </div>
</div>

  );
}


