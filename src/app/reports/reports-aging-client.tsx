"use client";

import { useEffect, useState } from "react";

type AgingRow = {
  internalId: string;
  status: string;
  createdAt: string;
  partnerAwb: string;
};

export default function ReportsAgingClient() {
  const [rows, setRows] = useState<AgingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/aging")
      .then((r) => r.json())
      .then((d) => setRows(d.aging ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50 text-left">
          <tr>
            <th className="p-3">Internal ID</th>
            <th className="p-3">Partner AWB</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created</th>
            <th className="p-3">Age (days)</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-4 text-gray-500">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-gray-500">
                No aging parcels (older than 7 days, not delivered).
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const age = Math.floor(
                (Date.now() - new Date(r.createdAt).getTime()) / (24 * 60 * 60 * 1000),
              );
              return (
                <tr key={r.internalId} className="border-t">
                  <td className="p-3 font-medium">{r.internalId}</td>
                  <td className="p-3">{r.partnerAwb}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{age}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
