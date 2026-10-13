"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { LogDetailDrawer, type LogDetailEntry } from "@/components/settings/log-detail-drawer";
import { LogsTelemetryTab } from "@/components/settings/logs-telemetry-tab";
import { IconEye } from "@/components/icons/nav-icons";

type Pagination = { page: number; limit: number; total: number; totalPages: number };
type Stats = {
  total: number;
  errorsToday: number;
  warningsToday: number;
  securityToday: number;
  avgDurationMs: number;
  uniqueUsersToday: number;
};

const SEVERITIES = ["INFO", "NOTICE", "WARN", "ERROR", "SECURITY"];

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
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export function LogsClient() {
  const [mainTab, setMainTab] = useState<"logs" | "telemetry">("logs");
  const [logs, setLogs] = useState<LogDetailEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    errorsToday: 0,
    warningsToday: 0,
    securityToday: 0,
    avgDurationMs: 0,
    uniqueUsersToday: 0,
  });
  const [filterOptions, setFilterOptions] = useState<{
    modules: string[];
    users: { id: string; name: string; email: string }[];
  }>({ modules: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selected, setSelected] = useState<LogDetailEntry | null>(null);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "50");
        if (search) params.set("search", search);
        if (moduleFilter) params.set("module", moduleFilter);
        if (severityFilter) params.set("severity", severityFilter);
        if (userFilter) params.set("userId", userFilter);
        if (fromDate) params.set("from", new Date(fromDate).toISOString());
        if (toDate) params.set("to", new Date(toDate).toISOString());

        const res = await fetch(`/api/logs?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load logs");
        setLogs(json.data ?? []);
        if (json.pagination) setPagination(json.pagination);
        if (json.stats) setStats(json.stats);
        if (json.filterOptions) setFilterOptions(json.filterOptions);
      } finally {
        setLoading(false);
      }
    },
    [search, moduleFilter, severityFilter, userFilter, fromDate, toDate],
  );

  useEffect(() => {
    if (mainTab === "logs") fetchLogs(1);
  }, [fetchLogs, mainTab]);

  useEffect(() => {
    if (!liveMode || mainTab !== "logs") return;
    const id = setInterval(() => fetchLogs(1), 15_000);
    return () => clearInterval(id);
  }, [liveMode, mainTab, fetchLogs]);

  async function handleExport(format: "csv" | "json") {
    setExportOpen(false);
    const params = new URLSearchParams();
    params.set("format", format);
    if (search) params.set("search", search);
    if (moduleFilter) params.set("module", moduleFilter);
    if (severityFilter) params.set("severity", severityFilter);
    if (userFilter) params.set("userId", userFilter);
    if (fromDate) params.set("from", new Date(fromDate).toISOString());
    if (toDate) params.set("to", new Date(toDate).toISOString());
    const res = await fetch(`/api/logs/export?${params}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasFilters = search || moduleFilter || severityFilter || userFilter || fromDate || toDate;

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title="System Logs"
        description="Enterprise audit trail — track every request, event, and data change across the system."
      />

      <div className="inline-flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-1">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            mainTab === "logs"
              ? "bg-[var(--surface)] text-[var(--text)] shadow-xs ring-1 ring-[var(--border)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
          onClick={() => setMainTab("logs")}
        >
          Live Logs Table
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            mainTab === "telemetry"
              ? "bg-[var(--surface)] text-[var(--text)] shadow-xs ring-1 ring-[var(--border)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
          onClick={() => setMainTab("telemetry")}
        >
          System Telemetry
        </button>
      </div>

      {mainTab === "telemetry" ? (
        <LogsTelemetryTab />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total entries" value={stats.total.toLocaleString()} tone="blue" />
            <StatCard label="Errors today" value={String(stats.errorsToday)} tone="red" />
            <StatCard label="Warnings today" value={String(stats.warningsToday)} tone="amber" />
            <StatCard label="Security events" value={String(stats.securityToday)} tone="violet" />
            <StatCard label="Avg response" value={stats.avgDurationMs ? `${stats.avgDurationMs}ms` : "—"} tone="emerald" />
            <StatCard label="Active users" value={String(stats.uniqueUsersToday)} tone="purple" />
          </div>

          <div className="card space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="input min-w-[240px] flex-1"
                placeholder="Search logs by action, module, correlation ID, IP, URL…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className={`btn ${showFilters || hasFilters ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setShowFilters((v) => !v)}
              >
                Filters
              </button>
              <button
                type="button"
                className={`btn ${liveMode ? "bg-emerald-500 text-white hover:bg-emerald-600" : "btn-ghost"}`}
                onClick={() => setLiveMode((v) => !v)}
              >
                {liveMode ? "Live" : "Real-time"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
                Refresh
              </button>
              <div className="relative">
                <button type="button" className="btn btn-ghost" onClick={() => setExportOpen((v) => !v)}>
                  Export ▾
                </button>
                {exportOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-raised)]"
                      onClick={() => handleExport("csv")}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-raised)]"
                      onClick={() => handleExport("json")}
                    >
                      Export JSON
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {showFilters ? (
              <div className="flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-3">
                <FilterField label="Module">
                  <select className="input" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
                    <option value="">All modules</option>
                    {filterOptions.modules.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Severity">
                  <select className="input" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                    <option value="">All severities</option>
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="User">
                  <select className="input min-w-[180px]" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                    <option value="">All users</option>
                    {filterOptions.users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="From">
                  <input type="datetime-local" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </FilterField>
                <FilterField label="To">
                  <input type="datetime-local" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </FilterField>
                {hasFilters ? (
                  <button
                    type="button"
                    className="btn btn-ghost text-red-600"
                    onClick={() => {
                      setSearch("");
                      setModuleFilter("");
                      setSeverityFilter("");
                      setUserFilter("");
                      setFromDate("");
                      setToDate("");
                    }}
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="data-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="erp-table text-sm">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Severity</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>User</th>
                    <th>IP address</th>
                    <th>Duration</th>
                    <th className="w-12 text-center">
                      <IconEye className="mx-auto opacity-50" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-[var(--muted)]">Loading…</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-[var(--muted)]">
                        No log entries found. System events will appear here as they occur.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const ts = formatTs(log.timestamp);
                      const sev = SEV_CLASS[log.severity] ?? SEV_CLASS.INFO;
                      return (
                        <tr key={log.id} className="cursor-pointer" onClick={() => setSelected(log)}>
                          <td>
                            <p className="font-mono text-xs">{ts.date}</p>
                            <p className="font-mono text-xs text-[var(--muted)]">{ts.time}</p>
                          </td>
                          <td>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sev}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td>
                            <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                              {log.module}
                            </span>
                          </td>
                          <td className="max-w-[200px] truncate font-medium">{log.action}</td>
                          <td>
                            {log.httpMethod ? (
                              <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold ${METHOD_CLASS[log.httpMethod] ?? ""}`}>
                                {log.httpMethod}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">—</span>
                            )}
                          </td>
                          <td>
                            {log.statusCode ? (
                              <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold ${statusClass(log.statusCode)}`}>
                                {log.statusCode}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">—</span>
                            )}
                          </td>
                          <td className="max-w-[120px] truncate text-xs">{log.user?.name ?? "System"}</td>
                          <td className="font-mono text-xs text-[var(--muted)]">{log.ip ?? "—"}</td>
                          <td className="font-mono text-xs">{log.durationMs != null ? `${log.durationMs}ms` : "—"}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="inline-flex rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(log);
                              }}
                            >
                              <IconEye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-raised)]/30 px-5 py-3">
                <p className="text-sm text-[var(--muted)]">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} entries
                </p>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost text-xs" disabled={pagination.page <= 1 || loading} onClick={() => fetchLogs(pagination.page - 1)}>
                    Prev
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-xs"
                    disabled={pagination.page >= pagination.totalPages || loading}
                    onClick={() => fetchLogs(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}

      {selected ? <LogDetailDrawer log={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "red" | "amber" | "violet" | "emerald" | "purple";
}) {
  const tones: Record<string, string> = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-300",
    red: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300",
    violet: "border-violet-500/20 bg-violet-500/5 text-violet-700 dark:text-violet-300",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-300",
  };
  return (
    <div className={`rounded-2xl border p-4 transition-all ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-[var(--text)]">{value}</p>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-[var(--muted)]">{label}</p>
      {children}
    </div>
  );
}
