"use client";

import { useEffect, useState } from "react";

export default function WarehousesSettingsClient() {
  const [warehouses, setWarehouses] = useState<
    {
      id: string;
      code: string;
      name: string;
      zones: {
        id: string;
        code: string;
        racks: { id: string; code: string; shelves: { id: string; label: string }[] }[];
      }[];
    }[]
  >([]);
  const [whForm, setWhForm] = useState({ code: "", name: "", city: "" });
  const [zoneForm, setZoneForm] = useState({ warehouseId: "", code: "", name: "" });
  const [rackForm, setRackForm] = useState({ zoneId: "", code: "" });
  const [shelfForm, setShelfForm] = useState({ rackId: "", code: "", label: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const data = await fetch("/api/warehouses").then((r) => r.json());
    setWarehouses(data.warehouses ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function post(url: string, body: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMsg(res.ok ? "Saved" : data.error);
    if (res.ok) load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Warehouses</h1>
      {msg ? <p className="text-sm text-green-800">{msg}</p> : null}
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          post("/api/warehouses", whForm);
        }}
      >
        <input
          placeholder="Code"
          className="rounded border px-3 py-2"
          value={whForm.code}
          onChange={(e) => setWhForm({ ...whForm, code: e.target.value })}
          required
        />
        <input
          placeholder="Name"
          className="rounded border px-3 py-2"
          value={whForm.name}
          onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
          required
        />
        <input
          placeholder="City"
          className="rounded border px-3 py-2"
          value={whForm.city}
          onChange={(e) => setWhForm({ ...whForm, city: e.target.value })}
        />
        <button type="submit" className="rounded bg-teal-700 px-4 py-2 text-white sm:col-span-3">
          Add warehouse
        </button>
      </form>
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          post(`/api/warehouses/${zoneForm.warehouseId}/zones`, {
            code: zoneForm.code,
            name: zoneForm.name,
          });
        }}
      >
        <select
          className="rounded border px-3 py-2"
          value={zoneForm.warehouseId}
          onChange={(e) => setZoneForm({ ...zoneForm, warehouseId: e.target.value })}
          required
        >
          <option value="">Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Zone code"
          className="rounded border px-3 py-2"
          value={zoneForm.code}
          onChange={(e) => setZoneForm({ ...zoneForm, code: e.target.value })}
          required
        />
        <input
          placeholder="Zone name"
          className="rounded border px-3 py-2"
          value={zoneForm.name}
          onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
          required
        />
        <button type="submit" className="rounded bg-blue-700 px-4 py-2 text-white">
          Add zone
        </button>
      </form>
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          post(`/api/zones/${rackForm.zoneId}/racks`, { code: rackForm.code });
        }}
      >
        <select
          className="rounded border px-3 py-2 sm:col-span-2"
          value={rackForm.zoneId}
          onChange={(e) => setRackForm({ ...rackForm, zoneId: e.target.value })}
          required
        >
          <option value="">Zone</option>
          {warehouses.flatMap((w) =>
            w.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {w.code}-{z.code}
              </option>
            )),
          )}
        </select>
        <input
          placeholder="Rack code"
          className="rounded border px-3 py-2"
          value={rackForm.code}
          onChange={(e) => setRackForm({ ...rackForm, code: e.target.value })}
          required
        />
        <button type="submit" className="rounded bg-indigo-700 px-4 py-2 text-white sm:col-span-3">
          Add rack
        </button>
      </form>
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          post(`/api/racks/${shelfForm.rackId}/shelves`, {
            code: shelfForm.code,
            label: shelfForm.label,
          });
        }}
      >
        <select
          className="rounded border px-3 py-2 sm:col-span-2"
          value={shelfForm.rackId}
          onChange={(e) => setShelfForm({ ...shelfForm, rackId: e.target.value })}
          required
        >
          <option value="">Rack</option>
          {warehouses.flatMap((w) =>
            w.zones.flatMap((z) =>
              z.racks.map((r) => (
                <option key={r.id} value={r.id}>
                  {w.code}-{z.code}-{r.code}
                </option>
              )),
            ),
          )}
        </select>
        <input
          placeholder="Shelf code"
          className="rounded border px-3 py-2"
          value={shelfForm.code}
          onChange={(e) => setShelfForm({ ...shelfForm, code: e.target.value })}
          required
        />
        <input
          placeholder="Label (A-04-02)"
          className="rounded border px-3 py-2"
          value={shelfForm.label}
          onChange={(e) => setShelfForm({ ...shelfForm, label: e.target.value })}
          required
        />
        <button type="submit" className="rounded bg-violet-700 px-4 py-2 text-white sm:col-span-4">
          Add shelf / bin
        </button>
      </form>
      <div className="space-y-3">
        {warehouses.map((w) => (
          <div key={w.id} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">
              {w.name} ({w.code})
            </p>
            <ul className="mt-2 text-sm text-gray-600">
              {w.zones.map((z) => (
                <li key={z.id}>
                  Zone {z.code}:{" "}
                  {z.racks.reduce((n, r) => n + r.shelves.length, 0)} locations
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
