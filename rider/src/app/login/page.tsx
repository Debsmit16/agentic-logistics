"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { APP_NAME, LOGO } from "@/lib/brand";

export default function RiderLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || phone.trim().length < 8) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          driverName: driverName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Login failed.");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/80 p-3 shadow-xl backdrop-blur-md">
            <Image
              src={LOGO.lg}
              alt="Agentic Rider"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">{APP_NAME}</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Courier Field Delivery & Digital e-POD Run-Sheet
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Driver Mobile Number <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-[var(--text-muted)] font-mono">
                  📱
                </span>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] py-2.5 pl-10 pr-3 font-mono text-sm text-[var(--text)] placeholder:font-sans placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Driver Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Sharma"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] py-2.5 px-3.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Start Shift & Open Run-Sheet →"}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] text-[var(--text-muted)]">
            Active run-sheets assigned by your dispatch hub will load automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

