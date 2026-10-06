"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

export default function PartnersSettingsClient() {
  const t = useT();
  const [partners, setPartners] = useState<
    { id: string; code: string; name: string; isActive: boolean }[]
  >([]);
  const [form, setForm] = useState({ code: "", name: "" });
  const [importPartner, setImportPartner] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [webhookPartner, setWebhookPartner] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [p, w] = await Promise.all([
      fetch("/api/partners").then((r) => r.json()),
      fetch("/api/warehouses").then((r) => r.json()),
    ]);
    setPartners(p.partners ?? []);
    setWarehouses(w.warehouses ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!webhookPartner) {
      setWebhookSecret("");
      setWebhookUrl("");
      return;
    }
    const base = typeof window !== "undefined" ? window.location.origin : "";
    setWebhookUrl(`${base}/api/webhooks/partners/${webhookPartner}`);
    fetch(`/api/partners/${webhookPartner}/integration`)
      .then((r) => r.json())
      .then((d) => setWebhookSecret(d.webhookSecret ?? ""));
  }, [webhookPartner]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("partnersTitle")}</h1>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <form
        className="flex flex-wrap gap-2 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/partners", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const data = await res.json();
          setMsg(res.ok ? "Partner added" : data.error);
          if (res.ok) load();
        }}
      >
        <input
          placeholder="Code (EKART)"
          className="rounded border px-3 py-2"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          placeholder="Name"
          className="rounded border px-3 py-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <button type="submit" className="rounded bg-teal-700 px-4 py-2 text-white">
          Add partner
        </button>
      </form>
      <ul className="space-y-2">
        {partners.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3">
            <span>
              {p.code} · {p.name} {p.isActive ? "" : "(inactive)"}
            </span>
            <button
              type="button"
              className="text-sm text-teal-700 underline"
              onClick={async () => {
                const res = await fetch("/api/partners", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
                });
                setMsg(res.ok ? "Partner updated" : "Error");
                if (res.ok) load();
              }}
            >
              {p.isActive ? "Deactivate" : "Activate"}
            </button>
          </li>
        ))}
      </ul>
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Webhook integration</h2>
        <p className="text-sm text-gray-600">
          Partners POST events with header <code className="text-xs">x-webhook-signature</code> = sha256(
          secret + &quot;.&quot; + raw body).
        </p>
        <select
          className="w-full rounded border px-3 py-2"
          value={webhookPartner}
          onChange={(e) => setWebhookPartner(e.target.value)}
        >
          <option value="">Select partner</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {webhookUrl ? (
          <>
            <p className="break-all text-xs text-gray-600">URL: {webhookUrl}</p>
            <input
              className="w-full rounded border px-3 py-2 font-mono text-sm"
              placeholder="Webhook secret (leave empty to disable verification)"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
            />
            <button
              type="button"
              className="rounded bg-teal-700 px-4 py-2 text-white"
              onClick={async () => {
                const res = await fetch(`/api/partners/${webhookPartner}/integration`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ webhookSecret: webhookSecret || null }),
                });
                setMsg(res.ok ? "Webhook secret saved" : "Error");
              }}
            >
              Save webhook secret
            </button>
          </>
        ) : null}
      </div>
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Import CSV</h2>
        <p className="text-sm text-gray-600">
          Columns: partnerAwb, receiverName, receiverPhone, addressLine1, city, state, pincode,
          paymentType, codAmount
        </p>
        <select
          className="w-full rounded border px-3 py-2"
          value={importPartner}
          onChange={(e) => setImportPartner(e.target.value)}
        >
          <option value="">Partner</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded border px-3 py-2"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        >
          <option value="">Warehouse (optional)</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept=".csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !importPartner) return;
            const fd = new FormData();
            fd.set("file", file);
            if (warehouseId) fd.set("warehouseId", warehouseId);
            const res = await fetch(`/api/partners/${importPartner}/import`, {
              method: "POST",
              body: fd,
            });
            const data = await res.json();
            setMsg(
              res.ok ? `Imported ${data.created?.length ?? 0} parcels` : data.error,
            );
          }}
        />
      </div>
    </div>
  );
}
