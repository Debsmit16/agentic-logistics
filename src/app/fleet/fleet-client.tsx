"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";

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

  const center =
    locations.length > 0
      ? `${locations.reduce((s, l) => s + l.latitude, 0) / locations.length},${
          locations.reduce((s, l) => s + l.longitude, 0) / locations.length
        }`
      : "19.076,72.8777";
  const mapQuery =
    locations.length > 0
      ? locations.map((l) => `${l.latitude},${l.longitude}`).join("|")
      : center;

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("fleetTitle")}
        description={t("fleetSubtitle")}
        actions={
          <button type="button" onClick={load} className="erp-btn erp-btn--primary erp-btn--sm">
            {t("refreshMap")}
          </button>
        }
      />
      <div className="erp-card overflow-hidden">
        <iframe
          title="Fleet map"
          className="h-72 w-full"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=11&output=embed`}
        />
      </div>
      {loading ? <p className="text-sm text-gray-500">{t("loading")}</p> : null}
      {!loading && locations.length === 0 ? (
        <p className="erp-alert erp-alert--info m-4">{t("noFleetPings")}</p>
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
