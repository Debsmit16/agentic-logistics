"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DeliveryFailedClient() {
  const [parcels, setParcels] = useState<
    { id: string; internalId: string; status: string }[]
  >([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function reload() {
    const data = await fetch("/api/parcels?status=DELIVERY_FAILED").then((r) => r.json());
    setParcels(data.items ?? []);
  }

  useEffect(() => {
    reload();
  }, []);

  async function act(id: string, path: string, body?: object) {
    const res = await fetch(`/api/parcels/${id}/${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    setMsg(res.ok ? "Updated" : data.error);
    if (res.ok) reload();
  }

  return (
    <div className="space-y-4">
      <Link href="/delivery" className="text-teal-700">
        ← Delivery
      </Link>
      <h1 className="text-2xl font-bold">Failed deliveries</h1>
      {msg ? <p>{msg}</p> : null}
      {parcels.map((p) => (
        <div key={p.id} className="rounded-lg border bg-white p-4">
          <p className="font-medium">{p.internalId}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded bg-amber-600 px-3 py-1 text-sm text-white"
              onClick={() => act(p.id, "reattempt")}
            >
              Schedule reattempt
            </button>
            <button
              type="button"
              className="rounded bg-orange-700 px-3 py-1 text-sm text-white"
              onClick={() => act(p.id, "return-warehouse")}
            >
              Return to warehouse
            </button>
            <button
              type="button"
              className="rounded bg-red-700 px-3 py-1 text-sm text-white"
              onClick={() =>
                act(p.id, "return-partner", { reason: "Return to partner" })
              }
            >
              Return to partner
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
