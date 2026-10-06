"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

export default function ReceiveClient() {
  const t = useT();
  const [scan, setScan] = useState("");
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parcelId, setParcelId] = useState<string | null>(null);

  async function lookup() {
    setError(null);
    const res = await fetch(`/api/parcels/scan?q=${encodeURIComponent(scan)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Parcel not found.");
      setParcelId(null);
      return;
    }
    setParcelId(data.parcel.id);
    setMessage(`${data.parcel.internalId} · ${data.parcel.status}`);
  }

  async function receive() {
    if (!parcelId) return;
    const res = await fetch(`/api/parcels/${parcelId}/receive`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMessage("Parcel received.");
  }

  async function weigh() {
    if (!parcelId || !weight) return;
    const res = await fetch(`/api/parcels/${parcelId}/weigh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: Number(weight) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMessage(`Weight saved: ${weight} KG`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{t("receiveParcel")}</h1>
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
      {message ? <p className="rounded-lg bg-green-50 p-3">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p> : null}
      {parcelId ? (
        <div className="space-y-3 border-t pt-4">
          <button
            type="button"
            onClick={receive}
            className="w-full rounded-xl bg-blue-700 py-4 text-lg font-semibold text-white"
          >
            Receive Parcel
          </button>
          <input
            className="w-full rounded-lg border px-4 py-3 text-lg"
            placeholder="Weight (KG)"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <button
            type="button"
            onClick={weigh}
            className="w-full rounded-xl bg-amber-600 py-4 text-lg font-semibold text-white"
          >
            Record weight
          </button>
        </div>
      ) : null}
    </div>
  );
}
