"use client";

import { useEffect, useState } from "react";

export default function DeliveryOpsClient() {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [parcels, setParcels] = useState<{ id: string; internalId: string; status: string }[]>([]);
  const [boys, setBoys] = useState<{ id: string; displayName: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [assignParcelId, setAssignParcelId] = useState("");
  const [deliveryBoyId, setDeliveryBoyId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/warehouses")
      .then((r) => r.json())
      .then((d) => setWarehouses(d.warehouses ?? []));
    fetch("/api/parcels?status=SORTED")
      .then((r) => r.json())
      .then((d) => setParcels(d.items ?? []));
    fetch("/api/parcels?status=REATTEMPT_SCHEDULED")
      .then((r) => r.json())
      .then((d) => setParcels((prev) => [...prev, ...(d.items ?? [])]));
    fetch("/api/delivery/delivery-boys")
      .then((r) => r.json())
      .then((d) => setBoys(d.deliveryBoys ?? []));
  }, []);

  async function createBatch() {
    const res = await fetch("/api/delivery-batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId, parcelIds: selected }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error);
      return;
    }
    setBatchId(data.batch.id);
    setMsg(`Batch ${data.batch.batchCode} created`);
  }

  async function assign() {
    if (!batchId) {
      setMsg("Create a batch first");
      return;
    }
    const res = await fetch("/api/delivery-batches", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId, parcelId: assignParcelId, deliveryBoyId }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Assigned" : data.error);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Delivery</h1>
      <a href="/delivery/failed" className="text-sm text-teal-700 underline">
        Failed deliveries & returns
      </a>
      {msg ? <p className="rounded bg-blue-50 p-3">{msg}</p> : null}
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Create batch</h2>
        <select
          className="w-full rounded border px-3 py-2"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        >
          <option value="">Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <div className="max-h-40 overflow-auto space-y-1">
          {parcels.map((p) => (
            <label key={p.id} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, p.id]
                      : selected.filter((x) => x !== p.id),
                  )
                }
              />
              {p.internalId} · {p.status}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={createBatch}
          className="rounded-lg bg-teal-700 px-4 py-2 text-white"
        >
          Create batch
        </button>
      </section>
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Assign delivery boy</h2>
        <select
          className="w-full rounded border px-3 py-2"
          value={assignParcelId}
          onChange={(e) => setAssignParcelId(e.target.value)}
        >
          <option value="">Parcel in batch</option>
          {selected.map((id) => {
            const p = parcels.find((x) => x.id === id);
            return (
              <option key={id} value={id}>
                {p?.internalId ?? id}
              </option>
            );
          })}
        </select>
        <select
          className="w-full rounded border px-3 py-2"
          value={deliveryBoyId}
          onChange={(e) => setDeliveryBoyId(e.target.value)}
        >
          <option value="">Delivery boy</option>
          {boys.map((b) => (
            <option key={b.id} value={b.id}>
              {b.displayName}
            </option>
          ))}
        </select>
        <button type="button" onClick={assign} className="rounded-lg bg-blue-700 px-4 py-2 text-white">
          Assign
        </button>
      </section>
    </div>
  );
}
