"use client";

import { useEffect, useState } from "react";

export default function NotificationsClient() {
  const [items, setItems] = useState<
    { id: string; title: string; body: string; isRead: boolean; createdAt: string }[]
  >([]);

  async function load() {
    const data = await fetch("/api/notifications").then((r) => r.json());
    setItems(data.notifications ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm"
          onClick={async () => {
            await fetch("/api/notifications", { method: "PATCH" });
            load();
          }}
        >
          Mark all read
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border p-3 ${n.isRead ? "bg-white" : "bg-teal-50"}`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-sm">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
