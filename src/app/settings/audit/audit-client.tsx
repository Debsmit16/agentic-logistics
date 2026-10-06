"use client";

import { useEffect, useState } from "react";

export default function AuditClient() {
  const [logs, setLogs] = useState<
    { id: string; action: string; entityType: string; createdAt: string; actor?: { displayName: string } }[]
  >([]);

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Audit log</h1>
      <ul className="mt-4 space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="rounded-lg border bg-white p-3 text-sm">
            <p className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
            <p>
              {log.actor?.displayName ?? "System"} · {log.action} · {log.entityType}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
