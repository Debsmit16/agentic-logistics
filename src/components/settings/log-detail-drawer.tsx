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
  INFO: "bg-blue-50 text-blue-700 border-blue-200",
  NOTICE: "bg-cyan-50 text-cyan-700 border-cyan-200",
  WARN: "bg-amber-50 text-amber-700 border-amber-200",
  ERROR: "bg-red-50 text-red-700 border-red-200",
  SECURITY: "bg-violet-50 text-violet-700 border-violet-200",
};

const METHOD_CLASS: Record<string, string> = {
  GET: "text-emerald-700 bg-emerald-50 border-emerald-200",
  POST: "text-blue-700 bg-blue-50 border-blue-200",
  PATCH: "text-amber-700 bg-amber-50 border-amber-200",
  PUT: "text-orange-700 bg-orange-50 border-orange-200",
  DELETE: "text-red-700 bg-red-50 border-red-200",
};

function statusClass(code: number | null) {
  if (!code) return "text-slate-400";
  if (code >= 200 && code < 300) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (code >= 400 && code < 500) return "text-amber-700 bg-amber-50 border-amber-200";
  if (code >= 500) return "text-red-700 bg-red-50 border-red-200";
  return "text-slate-600 bg-slate-50 border-slate-200";
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
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-[var(--surface)] shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg border p-2 ${sev}`}>
                <IconShield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Log Detail</h2>
                <p className="text-xs text-[var(--muted)]">{formatTs(log.timestamp)}</p>
              </div>
            </div>
            <button type="button" className="rounded-lg p-2 hover:bg-neutral-100" onClick={onClose} aria-label="Close panel">
              ✕
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sev}`}>{log.severity}</span>
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium">{log.module}</span>
          </div>
          <div className="mt-4 flex gap-1">
            {(["overview", "payload", "changes"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  tab === t ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-neutral-100"
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
                      <code className="rounded bg-neutral-100 px-2 py-1 text-xs">{log.correlationId ?? "—"}</code>
                      {log.correlationId ? (
                        <button type="button" className="text-xs text-[var(--primary)]" onClick={() => copyId(log.correlationId!)}>
                          {copied ? "Copied" : "Copy"}
                        </button>
                      ) : null}
                    </div>
                  </Field>
                  <Field label="Duration">
                    <p className="font-mono">{log.durationMs != null ? `${log.durationMs}ms` : "—"}</p>
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
                        <code className="block break-all rounded bg-neutral-100 px-2 py-1 text-xs">{log.requestUrl}</code>
                      </Field>
                    ) : null}
                  </div>
                </Section>
              )}

              <Section title="User">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <p className="font-semibold">{log.user?.name ?? "System"}</p>
                  </Field>
                  <Field label="Email">
                    <p>{log.user?.email ?? "—"}</p>
                  </Field>
                  <Field label="User ID" full>
                    {log.user?.id ? <code className="text-xs">{log.user.id}</code> : "N/A"}
                  </Field>
                </div>
              </Section>

              <Section title="Device & client">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="IP address">
                    <p className="font-mono">{log.ip ?? "—"}</p>
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
                <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-400">
                  {log.newValues ? JSON.stringify(log.newValues, null, 2) : "No payload recorded"}
                </pre>
              </Section>
            </div>
          ) : null}

          {tab === "changes" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-red-600">Before</p>
                <pre className="max-h-80 overflow-auto rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : "—"}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-emerald-700">After</p>
                <pre className="max-h-80 overflow-auto rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
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
