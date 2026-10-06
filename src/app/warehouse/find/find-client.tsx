"use client";

import { useState } from "react";

export default function FindParcelClient() {
  const [scan, setScan] = useState("");
  const [parcel, setParcel] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    setError(null);
    const res = await fetch(`/api/parcels/scan?q=${encodeURIComponent(scan)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setParcel(null);
      return;
    }
    setParcel(data.parcel);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Find Parcel</h1>
      <input
        className="w-full rounded-lg border px-4 py-3 text-lg"
        placeholder="Scan AWB / barcode"
        value={scan}
        onChange={(e) => setScan(e.target.value)}
      />
      <button
        type="button"
        onClick={lookup}
        className="w-full rounded-xl bg-violet-700 py-3 font-semibold text-white"
      >
        Find
      </button>
      {error ? <p className="text-red-700">{error}</p> : null}
      {parcel ? (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p>
            <strong>{String(parcel.internalId)}</strong> · {String(parcel.status)}
          </p>
          <p className="mt-2">{String((parcel as { receiverName?: string }).receiverName)}</p>
          <p>{String((parcel as { addressLine1?: string }).addressLine1)}</p>
        </div>
      ) : null}
    </div>
  );
}
