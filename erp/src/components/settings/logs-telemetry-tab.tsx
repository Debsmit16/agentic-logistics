"use client";

import { useEffect, useState } from "react";

type Telemetry = {
  since: string;
  byModule: { module: string; count: number }[];
  severityBreakdown: Record<string, number>;
  hourly: { hour: string; count: number }[];
};

export function LogsTelemetryTab() {
  const [data, setData] = useState<Telemetry | null>(null);

  useEffect(() => {
    fetch("/api/logs/telemetry")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <p className="text-sm text-[var(--muted)]">Loading telemetry…</p>;
  }

  const maxHour = Math.max(...data.hourly.map((h) => h.count), 1);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Activity in the last 24 hours (since {new Date(data.since).toLocaleString()}).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Events by module</h3>
          <ul className="mt-3 space-y-2">
            {data.byModule.length === 0 ? (
              <li className="text-xs text-[var(--muted)]">No events logged in the last 24h</li>
            ) : (
              data.byModule.map((m) => (
                <li key={m.module} className="flex items-center justify-between text-xs">
                  <span className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 font-semibold text-[var(--text)]">
                    {m.module}
                  </span>
                  <span className="font-mono font-semibold text-[var(--text)]">{m.count.toLocaleString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Severity Distribution (24h)</h3>
          <ul className="mt-3 space-y-2">
            {Object.entries(data.severityBreakdown).map(([sev, count]) => (
              <li key={sev} className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text)]">{sev}</span>
                <span className="font-mono font-semibold text-[var(--text)]">{count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold">Hourly volume</h3>
        <div className="mt-4 flex items-end gap-1 h-32">
          {data.hourly.map((h) => (
            <div key={h.hour} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-[var(--primary)]/80"
                style={{ height: `${(h.count / maxHour) * 100}%`, minHeight: h.count ? 4 : 0 }}
                title={`${h.count} events`}
              />
            </div>
          ))}
        </div>
        {data.hourly.length === 0 ? <p className="mt-2 text-xs text-[var(--muted)]">No hourly data yet.</p> : null}
      </div>
    </div>
  );
}
