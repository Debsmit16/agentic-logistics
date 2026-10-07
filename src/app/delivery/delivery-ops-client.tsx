"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";

export default function DeliveryOpsClient() {
  const t = useT();
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
      <PageHeader
        title={t("deliveryOps")}
        description={t("guideStepDeliveryBody")}
        actions={
          <Link href="/delivery/failed" className="erp-btn erp-btn--ghost erp-btn--sm">
            {t("failedDeliveries")}
          </Link>
        }
      />
      {msg ? <p className="erp-alert erp-alert--info">{msg}</p> : null}
      <section className="erp-section space-y-3">
        <h2 className="erp-section-title">{t("createBatch")}</h2>
        <select
          className="erp-select"
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
        <button type="button" onClick={createBatch} className="erp-btn erp-btn--primary">
          {t("createBatch")}
        </button>
      </section>
      <section className="erp-section space-y-3">
        <h2 className="erp-section-title">{t("assign")}</h2>
        <select
          className="erp-select"
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
          className="erp-select"
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
        <button type="button" onClick={assign} className="erp-btn erp-btn--primary">
          {t("assign")}
        </button>
      </section>
    </div>
  );
}
