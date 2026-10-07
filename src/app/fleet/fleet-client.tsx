"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { MapPin, RefreshCw, Radio, Navigation, ExternalLink } from "lucide-react";

type LocationPing = {
  userId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  recordedAt: string;
};

export default function FleetClient() {
  const t = useT();
  const [locations, setLocations] = useState<LocationPing[]>([]);
  const [center, setCenter] = useState("19.0760,72.8777");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/fleet/locations");
      const data = await res.json();
      setLocations(data.locations ?? []);
      if (data.center) {
        setCenter(`${data.center.lat},${data.center.lng}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const mapQuery =
    locations.length > 0
      ? locations.map((l) => `${l.latitude},${l.longitude}`).join("|")
      : center;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title={t("fleetTitle")}
        description={t("fleetSubtitle")}
        actions={
          <button
            type="button"
            onClick={load}
            className="skeuo-btn skeuo-btn-secondary px-4 py-2.5 text-xs font-bold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("refreshMap")}</span>
          </button>
        }
      />

      {/* Map Embed Card */}
      <div className="skeuo-card overflow-hidden">
        <iframe
          title="Fleet map"
          className="h-80 w-full border-0"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=11&output=embed`}
        />
      </div>

      {loading && locations.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t("loading")}</p>
      ) : null}

      {!loading && locations.length === 0 ? (
        <div className="skeuo-card p-6 text-center space-y-2">
          <Radio className="w-8 h-8 text-[var(--text-muted)] mx-auto animate-pulse" />
          <p className="text-sm font-bold text-[var(--text-primary)]">{t("noFleetPings")}</p>
          <p className="text-xs text-[var(--text-muted)]">Riders will appear here in real-time when active GPS tracking is enabled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
            <span>Active Field Drivers ({locations.length})</span>
            <span className="text-emerald-500 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live Telemetry
            </span>
          </div>

          <div className="grid gap-3">
            {locations.map((l) => (
              <div key={l.userId} className="skeuo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[var(--text-primary)]">{l.displayName}</span>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t("lastSeen")}: {new Date(l.recordedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {l.speedKmh != null ? (
                    <span className="skeuo-badge px-2.5 py-1 text-xs bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                      {l.speedKmh.toFixed(0)} km/h
                    </span>
                  ) : null}
                  <a
                    className="skeuo-btn skeuo-btn-secondary skeuo-btn-xs font-mono font-bold text-xs gap-1.5"
                    href={`https://www.google.com/maps?q=${l.latitude},${l.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{l.latitude.toFixed(4)}, {l.longitude.toFixed(4)}</span>
                    <ExternalLink className="w-3 h-3 text-[var(--accent-primary)]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
