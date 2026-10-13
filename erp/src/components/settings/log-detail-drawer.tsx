"use client";

import { useState } from "react";
import { IconShield } from "@/components/icons/nav-icons";

export type LogDetailEntry = {
  id: string;
  timestamp: string;
  correlationId: string | null;
  module: string;
  severity: string;
  action: string;
  entityId: string | null;
  ip: string | null;
  userAgent: string | null;
  durationMs: number | null;
  httpMethod: string | null;
  statusCode: number | null;
  requestUrl: string | null;
  oldValues: unknown;
  newValues: unknown;
  user: { id: string; name: string; email: string } | null;
};

const SEV_CLASS: Record<string, string> = {
  INFO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
  NOTICE: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25",
  WARN: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
  ERROR: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
  SECURITY: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/25",
};

const METHOD_CLASS: Record<string, string> = {
  GET: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  POST: "text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
  PATCH: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
  PUT: "text-orange-700 dark:text-orange-400 bg-orange-500/10 border-orange-500/25",
  DELETE: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",
};

function statusClass(code: number | null) {
  if (!code) return "text-[var(--muted)]";
  if (code >= 200 && code < 300) return "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  if (code >= 400 && code < 500) return "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25";
  if (code >= 500) return "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25";
  return "text-[var(--muted)] bg-[var(--surface-raised)] border-[var(--border)]";
}

function formatTs(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LogDetailDrawer({ log, onClose }: { log: LogDetailEntry; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "payload" | "changes">("overview");
  const [copied, setCopied] = useState(false);
  const sev = SEV_CLASS[log.severity] ?? SEV_CLASS.INFO;

  function copyId(text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-xs" aria-label="Close" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-[var(--surface)] shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl border p-2 ${sev}`}>
                <IconShield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text)]">Telemetry Event Detail</h2>
                <p className="text-xs text-[var(--muted)]">{formatTs(log.timestamp)}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
              onClick={onClose}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sev}`}>{log.severity}</span>
            <span className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-semibold text-[var(--text)]">
              {log.module}
            </span>
          </div>
          <div className="mt-4 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-1">
            {(["overview", "payload", "changes"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  tab === t
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-xs ring-1 ring-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                onClick={() => setTab(t)}
              >
                {t === "overview" ? "Overview" : t === "payload" ? "Payload & Meta" : "Data Changes"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm">
          {tab === "overview" ? (
            <div className="space-y-6">
              <Section title="Event summary">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Action" full>
                    <p className="font-semibold">{log.action}</p>
                  </Field>
                  <Field label="Correlation ID" full>
                    <div className="flex items-center gap-2">
                      <code className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-xs font-mono">{log.correlationId ?? "—"}</code>
                      {log.correlationId ? (
                        <button type="button" className="text-xs text-[var(--primary)] font-semibold" onClick={() => copyId(log.correlationId!)}>
                          {copied ? "Copied" : "Copy"}
                        </button>
                      ) : null}
                    </div>
                  </Field>
                  <Field label="Duration">
                    <p className="font-mono text-xs">{log.durationMs != null ? `${log.durationMs}ms` : "—"}</p>
                  </Field>
                  <Field label="Entity ID">
                    <p className="font-mono text-xs break-all">{log.entityId ?? "—"}</p>
                  </Field>
                </div>
              </Section>

              {(log.httpMethod || log.requestUrl || log.statusCode) && (
                <Section title="Request info">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="HTTP method">
                      {log.httpMethod ? (
                        <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-bold ${METHOD_CLASS[log.httpMethod] ?? ""}`}>
                          {log.httpMethod}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Field>
                    <Field label="Status code">
                      {log.statusCode ? (
                        <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-bold ${statusClass(log.statusCode)}`}>
                          {log.statusCode}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Field>
                    {log.requestUrl ? (
                      <Field label="URL" full>
                        <code className="block break-all rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs font-mono">{log.requestUrl}</code>
                      </Field>
                    ) : null}
                  </div>
                </Section>
              )}

              <Section title="User">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <p className="font-semibold text-[var(--text)]">{log.user?.name ?? "System"}</p>
                  </Field>
                  <Field label="Email">
                    <p className="text-[var(--text)]">{log.user?.email ?? "—"}</p>
                  </Field>
                  <Field label="User ID" full>
                    {log.user?.id ? <code className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-xs font-mono">{log.user.id}</code> : "N/A"}
                  </Field>
                </div>
              </Section>

              <Section title="Device & client">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="IP address">
                    <p className="font-mono text-xs">{log.ip ?? "—"}</p>
                  </Field>
                  {log.userAgent ? (
                    <Field label="User agent" full>
                      <p className="break-all text-xs text-[var(--muted)]">{log.userAgent}</p>
                    </Field>
                  ) : null}
                </div>
              </Section>
            </div>
          ) : null}

          {tab === "payload" ? (
            <div className="space-y-4">
              <Section title="New values / payload">
                <pre className="max-h-96 overflow-auto rounded-xl border border-[var(--border)] bg-slate-950 p-4 text-xs font-mono text-emerald-400">
                  {log.newValues ? JSON.stringify(log.newValues, null, 2) : "No payload recorded"}
                </pre>
              </Section>
            </div>
          ) : null}

          {tab === "changes" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Before</p>
                <pre className="max-h-80 overflow-auto rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs font-mono text-rose-700 dark:text-rose-300">
                  {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : "—"}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">After</p>
                <pre className="max-h-80 overflow-auto rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                  {log.newValues ? JSON.stringify(log.newValues, null, 2) : "—"}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="mb-1 text-xs text-[var(--muted)]">{label}</p>
      {children}
    </div>
  );
}
