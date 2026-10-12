"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { Modal } from "@/components/ui/modal";
import { IconEye, IconShield } from "@/components/icons/nav-icons";

type LogEntry = {
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
  oldValues: unknown;
  newValues: unknown;
  user: { id: string; name: string; email: string } | null;
};

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
  INFO: "bg-blue-50 text-blue-700 border-blue-200",
  NOTICE: "bg-cyan-50 text-cyan-700 border-cyan-200",
  WARN: "bg-amber-50 text-amber-700 border-amber-200",
  ERROR: "bg-red-50 text-red-700 border-red-200",
  SECURITY: "bg-violet-50 text-violet-700 border-violet-200",
};

function formatTs(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export function LogsClient() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
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
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(pagination.limit));
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
        setPagination(json.pagination ?? pagination);
        if (json.stats) setStats(json.stats);
        if (json.filterOptions) setFilterOptions(json.filterOptions);
      } finally {
        setLoading(false);
      }
    },
    [search, moduleFilter, severityFilter, userFilter, fromDate, toDate, pagination.limit],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  async function handleExport(format: "csv" | "json") {
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
    <div className="space-y-6">
      <ErpPageHeader title="System Logs" description="Enterprise audit trail and system event log viewer." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total entries" value={stats.total.toLocaleString()} />
        <StatCard label="Errors today" value={String(stats.errorsToday)} tone="red" />
        <StatCard label="Warnings today" value={String(stats.warningsToday)} tone="amber" />
        <StatCard label="Security events" value={String(stats.securityToday)} tone="violet" />
        <StatCard label="Avg duration" value={stats.avgDurationMs ? `${stats.avgDurationMs}ms` : "—"} />
        <StatCard label="Active users" value={String(stats.uniqueUsersToday)} />
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input min-w-[220px] flex-1"
            placeholder="Search action, entity, correlation ID, IP…"
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
          <button type="button" className="btn btn-ghost" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
            Refresh
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => handleExport("csv")}>Export CSV</button>
          <button type="button" className="btn btn-ghost" onClick={() => handleExport("json")}>Export JSON</button>
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
        <div className="data-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <IconShield />
            </div>
            <div>
              <h2 className="text-base font-semibold">Activity log</h2>
              <p className="text-sm text-[var(--muted)]">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} entries
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Module</th>
                <th>Action</th>
                <th>User</th>
                <th>IP</th>
                <th>Duration</th>
                <th className="w-12 text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[var(--muted)]">Loading…</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[var(--muted)]">
                    No log entries found.
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
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium">{log.module}</span>
                      </td>
                      <td className="font-medium">{log.action}</td>
                      <td className="text-sm">{log.user?.name ?? "System"}</td>
                      <td className="font-mono text-xs text-[var(--muted)]">{log.ip ?? "—"}</td>
                      <td className="font-mono text-xs">{log.durationMs != null ? `${log.durationMs}ms` : "—"}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="inline-flex rounded-lg p-1.5 hover:bg-neutral-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(log);
                          }}
                        >
                          <IconEye className="text-[var(--muted)]" />
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-3">
            <p className="text-sm text-[var(--muted)]">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost text-xs"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchLogs(pagination.page - 1)}
              >
                Previous
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

      <Modal
        open={Boolean(selected)}
        title="Log detail"
        description={selected ? formatTs(selected.timestamp).date + " " + formatTs(selected.timestamp).time : ""}
        onClose={() => setSelected(null)}
        wide
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Severity" value={selected.severity} />
              <Detail label="Module" value={selected.module} />
              <Detail label="Action" value={selected.action} />
              <Detail label="Entity ID" value={selected.entityId ?? "—"} />
              <Detail label="Correlation" value={selected.correlationId ?? "—"} />
              <Detail label="User" value={selected.user ? `${selected.user.name} (${selected.user.email})` : "System"} />
              <Detail label="IP" value={selected.ip ?? "—"} />
              <Detail label="Duration" value={selected.durationMs != null ? `${selected.durationMs}ms` : "—"} />
            </div>
            {selected.oldValues ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-[var(--muted)]">Before</p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-red-50 p-3 text-xs">{JSON.stringify(selected.oldValues, null, 2)}</pre>
              </div>
            ) : null}
            {selected.newValues ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-[var(--muted)]">After</p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-emerald-50 p-3 text-xs">{JSON.stringify(selected.newValues, null, 2)}</pre>
              </div>
            ) : null}
            {selected.userAgent ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-[var(--muted)]">User agent</p>
                <p className="break-all text-xs text-[var(--muted)]">{selected.userAgent}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "red" | "amber" | "violet" }) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50/80"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50/80"
        : tone === "violet"
          ? "border-violet-200 bg-violet-50/80"
          : "border-[var(--border)] bg-[var(--surface)]";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="font-medium break-all">{value}</p>
    </div>
  );
}
