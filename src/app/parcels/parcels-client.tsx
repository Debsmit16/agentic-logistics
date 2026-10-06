"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";

type Parcel = {
  id: string;
  internalId: string;
  partnerAwb: string;
  status: string;
  receiverName: string;
};

export default function ParcelsClient() {
  const t = useT();
  const [items, setItems] = useState<Parcel[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string; code: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    partnerId: "",
    partnerAwb: "",
    receiverName: "",
    receiverPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    paymentType: "PREPAID",
    codAmount: "0",
    warehouseId: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [p, part, wh] = await Promise.all([
      fetch(`/api/parcels?q=${encodeURIComponent(q)}`).then((r) => r.json()),
      fetch("/api/partners").then((r) => r.json()),
      fetch("/api/warehouses").then((r) => r.json()),
    ]);
    setItems(p.items ?? []);
    setPartners(part.partners ?? []);
    setWarehouses(wh.warehouses ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createParcel(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/parcels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        codAmount: Number(form.codAmount),
        warehouseId: form.warehouseId || undefined,
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Created ${data.parcel.internalId}` : data.error);
    if (res.ok) load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("navParcels")}</h1>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2"
            placeholder="Search AWB / ID / phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" onClick={load} className="rounded-lg bg-teal-700 px-4 text-white">
            Search
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {items.map((p) => (
            <li key={p.id} className="rounded-lg border bg-white p-3">
              <Link href={`/parcels/${p.id}`} className="font-medium text-teal-800">
                {p.internalId}
              </Link>{" "}
              · {p.partnerAwb} · {p.status}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={createParcel} className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="text-lg font-semibold">Create parcel</h2>
        <select
          required
          className="w-full rounded border px-3 py-2"
          value={form.partnerId}
          onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
        >
          <option value="">Select partner</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {[
          ["partnerAwb", "AWB"],
          ["receiverName", "Receiver name"],
          ["receiverPhone", "Receiver phone"],
          ["addressLine1", "Address"],
          ["city", "City"],
          ["state", "State"],
          ["pincode", "Pincode"],
        ].map(([key, label]) => (
          <input
            key={key}
            required
            className="w-full rounded border px-3 py-2"
            placeholder={label}
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ))}
        <select
          className="w-full rounded border px-3 py-2"
          value={form.warehouseId}
          onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
        >
          <option value="">Warehouse (optional)</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-white">
          Create
        </button>
        {message ? <p className="text-sm text-green-800">{message}</p> : null}
      </form>
    </div>
  );
}
