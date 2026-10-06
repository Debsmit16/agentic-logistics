"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

type Loc = {
  userId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
  speedKmh: number | null;
};

export default function FleetClient() {
  const t = useT();
  const [locations, setLocations] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/fleet/locations").then((r) => r.json());
    setLocations(data.locations ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const center = locations[0]
    ? `${locations[0].latitude},${locations[0].longitude}`
    : "20.5937,78.9629";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t("fleetTitle")}</h1>
          <p className="text-sm text-gray-600">{t("fleetSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-teal-700 px-4 py-2 text-white text-sm"
        >
          {t("refreshMap")}
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <iframe
          title="Fleet map"
          className="h-72 w-full"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(center)}&z=12&output=embed`}
        />
      </div>
      {loading ? <p className="text-sm text-gray-500">{t("loading")}</p> : null}
      {!loading && locations.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">{t("noFleetPings")}</p>
      ) : (
        <ul className="space-y-2">
          {locations.map((l) => (
            <li key={l.userId} className="flex flex-wrap justify-between gap-2 rounded-lg border bg-white p-3 text-sm">
              <span className="font-medium">{l.displayName}</span>
              <span className="text-gray-500">
                {t("lastSeen")}: {new Date(l.recordedAt).toLocaleTimeString()}
              </span>
              <a
                className="text-teal-700 underline"
                href={`https://www.google.com/maps?q=${l.latitude},${l.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}
                {l.speedKmh != null ? ` · ${l.speedKmh.toFixed(0)} km/h` : ""}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
