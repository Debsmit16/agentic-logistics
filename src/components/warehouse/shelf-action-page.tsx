"use client";

import { useEffect, useState } from "react";
import { WarehouseScanPanel } from "@/components/warehouse/scan-panel";

export function ShelfActionPage({
  title,
  actionLabel,
  endpoint,
}: {
  title: string;
  actionLabel: string;
  endpoint: "store" | "move" | "return-receive";
}) {
  const [shelves, setShelves] = useState<{ id: string; label: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/me").then((r) => r.json());
      const whRes = await fetch("/api/warehouses").then((r) => r.json());
      const wh =
        me.user?.warehouseId ??
        whRes.warehouses?.[0]?.id ??
        null;
      setWarehouseId(wh);
      if (wh) {
        const s = await fetch(`/api/warehouses/${wh}/shelves`).then((r) => r.json());
        setShelves(s.shelves ?? []);
      }
    }
    load();
  }, []);

  async function onAction(parcelId: string, shelfId?: string) {
    if (!shelfId) throw new Error("Select a location.");
    const res = await fetch(`/api/parcels/${parcelId}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelfId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
  }

  if (!warehouseId) {
    return (
      <p className="rounded-lg bg-amber-50 p-4">
        Add a warehouse and locations in Settings → Warehouses first.
      </p>
    );
  }

  return (
    <WarehouseScanPanel
      title={title}
      actionLabel={actionLabel}
      showShelfPicker
      shelves={shelves}
      onAction={onAction}
    />
  );
}

export function SimpleScanActionPage({
  title,
  actionLabel,
  endpoint,
}: {
  title: string;
  actionLabel: string;
  endpoint: string;
}) {
  async function onAction(parcelId: string) {
    const res = await fetch(`/api/parcels/${parcelId}/${endpoint}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
  }

  return (
    <WarehouseScanPanel title={title} actionLabel={actionLabel} onAction={onAction} />
  );
}
