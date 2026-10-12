"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/brand/app-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }
    router.push(data.redirect ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-6 p-8 shadow-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <AppLogo size="lg" />
          <div>
            <h1 className="erp-hero-title text-2xl">Sign in</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Enter your credentials to access the ERP.</p>
          </div>
        </div>
        <label className="block text-sm font-medium">
          Email
          <input
            className="input mt-1.5"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="input mt-1.5"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-full py-2.5">
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
