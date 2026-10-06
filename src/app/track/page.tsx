"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function TrackPage() {
  const [awb, setAwb] = useState("");
  const [events, setEvents] = useState<
    { createdAt: string; eventType: string; message: string | null }[]
  >([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function track() {
    setError(null);
    const res = await fetch(`/api/track?q=${encodeURIComponent(awb)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Tracking number not found.");
      setEvents([]);
      setStatus(null);
      return;
    }
    setStatus(data.parcel.status);
    setEvents(data.parcel.events);
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="mb-6 flex justify-center">
        <BrandLogo size="md" href="/" />
      </div>
      <h1 className="text-2xl font-bold">Track parcel</h1>
      <input
        className="mt-4 w-full rounded-lg border px-4 py-3"
        placeholder="AWB / tracking number"
        value={awb}
        onChange={(e) => setAwb(e.target.value)}
      />
      <button
        type="button"
        onClick={track}
        className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-semibold text-white"
      >
        Track
      </button>
      {error ? <p className="mt-3 text-red-700">{error}</p> : null}
      {status ? (
        <p className="mt-4 text-lg font-semibold">Status: {status.replaceAll("_", " ")}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {events.map((ev) => (
          <li key={ev.createdAt + ev.eventType} className="rounded-lg border bg-white p-3">
            <p className="text-sm text-gray-500">{new Date(ev.createdAt).toLocaleString()}</p>
            <p className="font-medium">{ev.message ?? ev.eventType}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
