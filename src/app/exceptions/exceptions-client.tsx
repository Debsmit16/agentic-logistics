"use client";

import { useEffect, useState } from "react";

export default function ExceptionsClient() {
  const [items, setItems] = useState<
    {
      id: string;
      code: string;
      title: string;
      status: string;
      parcel?: { internalId: string };
    }[]
  >([]);

  async function load() {
    const data = await fetch("/api/exceptions").then((r) => r.json());
    setItems(data.exceptions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Exceptions</h1>
      <ul className="mt-4 space-y-2">
        {items.map((ex) => (
          <li key={ex.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
            <div>
              <p className="font-medium">{ex.title}</p>
              <p className="text-sm text-gray-600">
                {ex.code} · {ex.parcel?.internalId ?? "—"} · {ex.status}
              </p>
            </div>
            {ex.status === "OPEN" ? (
              <button
                type="button"
                className="rounded bg-teal-700 px-3 py-1 text-sm text-white"
                onClick={async () => {
                  await fetch("/api/exceptions", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: ex.id }),
                  });
                  load();
                }}
              >
                Resolve
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
