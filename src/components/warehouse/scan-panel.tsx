"use client";

import { useState } from "react";

type Shelf = { id: string; label: string };

export function WarehouseScanPanel({
  title,
  actionLabel,
  onAction,
  showShelfPicker = false,
  shelves = [],
}: {
  title: string;
  actionLabel: string;
  onAction: (parcelId: string, shelfId?: string) => Promise<void>;
  showShelfPicker?: boolean;
  shelves?: Shelf[];
}) {
  const [scan, setScan] = useState("");
  const [parcelId, setParcelId] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [shelfId, setShelfId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setError(null);
    const res = await fetch(`/api/parcels/scan?q=${encodeURIComponent(scan)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setParcelId(null);
      return;
    }
    setParcelId(data.parcel.id);
    setInfo(`${data.parcel.internalId} · ${data.parcel.status}`);
  }

  async function runAction() {
    if (!parcelId) return;
    setLoading(true);
    setError(null);
    try {
      await onAction(parcelId, shelfId || undefined);
      setInfo("Done.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <input
        className="w-full rounded-lg border px-4 py-3 text-lg"
        placeholder="Scan AWB / barcode"
        value={scan}
        onChange={(e) => setScan(e.target.value)}
      />
      <button
        type="button"
        onClick={lookup}
        className="w-full rounded-xl bg-teal-700 py-3 font-semibold text-white"
      >
        Find parcel
      </button>
      {info ? <p className="rounded-lg bg-blue-50 p-3">{info}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p> : null}
      {parcelId && showShelfPicker ? (
        <select
          className="w-full rounded-lg border px-4 py-3 text-lg"
          value={shelfId}
          onChange={(e) => setShelfId(e.target.value)}
        >
          <option value="">Select location</option>
          {shelves.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      ) : null}
      {parcelId ? (
        <button
          type="button"
          disabled={loading || (showShelfPicker && !shelfId)}
          onClick={runAction}
          className="w-full rounded-xl bg-blue-700 py-4 text-lg font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Please wait…" : actionLabel}
        </button>
      ) : null}
    </div>
  );
}
