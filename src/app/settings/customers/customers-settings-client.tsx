"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  _count: { parcels: number };
};

export default function CustomersSettingsClient() {
  const t = useT();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function load(search?: string) {
    const url = search ? `/api/customers?q=${encodeURIComponent(search)}` : "/api/customers";
    const data = await fetch(url).then((r) => r.json());
    setCustomers(data.customers ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("customersTitle")}</h1>
      <p className="text-sm text-gray-600">
        Auto-created when parcels are imported. Search by name, phone, or email.
      </p>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded border px-3 py-2"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className="rounded bg-gray-800 px-4 py-2 text-white" onClick={() => load(q)}>
          Search
        </button>
      </div>
      <form
        className="flex flex-wrap gap-2 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              phone: form.phone,
              email: form.email || undefined,
            }),
          });
          const data = await res.json();
          setMsg(res.ok ? "Customer added" : data.error);
          if (res.ok) load();
        }}
      >
        <input
          placeholder="Name"
          className="rounded border px-3 py-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Phone"
          className="rounded border px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          className="rounded border px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit" className="rounded bg-teal-700 px-4 py-2 text-white">
          Add customer
        </button>
      </form>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="rounded-lg border bg-white p-3 text-sm">
            {c.name} · {c.phone}
            {c.email ? ` · ${c.email}` : ""} · {c._count.parcels} parcels
          </li>
        ))}
      </ul>
    </div>
  );
}
