"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LOGO } from "@/lib/brand";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { ParcelCard, type ParcelItem } from "@/components/parcel-card";
import { EpodModal } from "@/components/epod-modal";
import { NdrModal } from "@/components/ndr-modal";

interface TripData {
  id: string;
  tripNumber: string;
  status: string;
  type: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originHub: string;
  destinationHub?: string | null;
  orders: ParcelItem[];
}

interface MetricsData {
  totalParcels: number;
  deliveredParcels: number;
  pendingParcels: number;
  deliveredCod: number;
  pendingCod: number;
}

export default function RiderDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [trip, setTrip] = useState<TripData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData>({
    totalParcels: 0,
    deliveredParcels: 0,
    pendingParcels: 0,
    deliveredCod: 0,
    pendingCod: 0,
  });

  const [filter, setFilter] = useState<"ALL" | "PENDING" | "DELIVERED">("PENDING");
  const [search, setSearch] = useState("");

  // Modals
  const [selectedOrderForDeliver, setSelectedOrderForDeliver] = useState<ParcelItem | null>(null);
  const [selectedOrderForNdr, setSelectedOrderForNdr] = useState<ParcelItem | null>(null);

  const checkAuthAndLoad = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authJson = await authRes.json();
      setDriverName(authJson.rider?.driverName || "Driver");
      setDriverPhone(authJson.rider?.driverPhone || "");
      setVehicleNumber(authJson.rider?.vehicleNumber || "");

      const tripRes = await fetch("/api/trip/active");
      const tripJson = await tripRes.json();
      if (tripJson.trip) {
        setTrip(tripJson.trip);
        if (tripJson.trip.vehicleNumber) {
          setVehicleNumber(tripJson.trip.vehicleNumber);
        }
      }
      if (tripJson.metrics) {
        setMetrics(tripJson.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const filteredOrders = useMemo(() => {
    if (!trip?.orders) return [];
    return trip.orders.filter((ord) => {
      // Status filter
      if (filter === "PENDING" && ord.status === "DELIVERED") return false;
      if (filter === "DELIVERED" && ord.status !== "DELIVERED") return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          ord.awbNumber.toLowerCase().includes(q) ||
          ord.receiverName.toLowerCase().includes(q) ||
          ord.receiverAddress.toLowerCase().includes(q) ||
          ord.receiverPincode.includes(q)
        );
      }
      return true;
    });
  }, [trip, filter, search]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="mt-3 text-xs font-bold text-[var(--text-muted)]">Loading Active Run-Sheet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[var(--bg)]">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Image
            src={LOGO.sm}
            alt="Agentic Rider"
            width={28}
            height={28}
            className="rounded-lg object-contain"
          />
          <div>
            <h2 className="text-xs font-black text-[var(--text)] tracking-tight">{driverName}</h2>
            <p className="font-mono text-[10px] text-[var(--text-muted)]">
              {vehicleNumber || driverPhone}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300"
        >
          Sign Out
        </button>
      </header>

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      <main className="p-4 space-y-4">
        {!trip ? (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl">
            <span className="text-4xl">🛵</span>
            <h3 className="mt-3 text-base font-bold text-[var(--text)]">No Active Run-Sheet</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              You do not have any parcels assigned right now. Please ask the hub dispatch supervisor to assign a trip to your phone ({driverPhone}).
            </p>
            <button
              type="button"
              onClick={checkAuthAndLoad}
              className="mt-5 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow hover:bg-emerald-500"
            >
              ↻ Refresh Run-Sheet
            </button>
          </div>
        ) : (
          <>
            {/* Shift Summary Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Active Run-Sheet
                  </span>
                  <h3 className="font-mono text-sm font-black text-[var(--text)]">{trip.tripNumber}</h3>
                </div>
                <div className="text-right">
                  <span className="rounded bg-[var(--surface-raised)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--text-muted)]">
                    {trip.vehicleNumber}
                  </span>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{trip.originHub}</p>
                </div>
              </div>

              {/* KPI Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-2.5">
                  <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Total</span>
                  <p className="text-lg font-black text-[var(--text)]">{metrics.totalParcels}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                  <span className="text-[9px] font-bold uppercase text-emerald-400">Delivered</span>
                  <p className="text-lg font-black text-emerald-400">{metrics.deliveredParcels}</p>
                </div>
                <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-2.5">
                  <span className="text-[9px] font-bold uppercase text-sky-400">Pending</span>
                  <p className="text-lg font-black text-sky-400">{metrics.pendingParcels}</p>
                </div>
              </div>

              {/* COD Cash In Hand Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💵</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400">Cash-In-Hand Collected</span>
                    <p className="text-base font-black text-amber-400">₹{metrics.deliveredCod.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-semibold text-[var(--text-muted)]">Pending COD</span>
                  <p className="font-mono text-xs font-bold text-[var(--text)]">₹{metrics.pendingCod.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="space-y-2">
              <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1">
                <button
                  type="button"
                  onClick={() => setFilter("PENDING")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    filter === "PENDING"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  Pending ({metrics.pendingParcels})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("DELIVERED")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    filter === "DELIVERED"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  Delivered ({metrics.deliveredParcels})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    filter === "ALL"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  All ({metrics.totalParcels})
                </button>
              </div>

              <input
                type="text"
                placeholder="Search recipient, AWB, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Parcel List */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center text-xs text-[var(--text-muted)]">
                  {filter === "PENDING"
                    ? "🎉 All parcels on this run-sheet have been completed!"
                    : "No consignments match this filter."}
                </div>
              ) : (
                filteredOrders.map((ord, idx) => (
                  <ParcelCard
                    key={ord.id}
                    order={ord}
                    index={idx}
                    onDeliver={(o) => setSelectedOrderForDeliver(o)}
                    onNdr={(o) => setSelectedOrderForNdr(o)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Cash Tally Bar */}
      {trip && (
        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 px-5 py-3 backdrop-blur-lg">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Shift Progress</p>
              <p className="font-mono text-xs font-extrabold text-[var(--text)]">
                {metrics.deliveredParcels} of {metrics.totalParcels} Delivered
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-amber-400">Total COD Remittance</p>
              <p className="font-mono text-sm font-black text-amber-400">
                ₹{metrics.deliveredCod.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Digital e-POD Modal */}
      {selectedOrderForDeliver && (
        <EpodModal
          open={Boolean(selectedOrderForDeliver)}
          order={selectedOrderForDeliver}
          onClose={() => setSelectedOrderForDeliver(null)}
          onSuccess={() => {
            checkAuthAndLoad();
          }}
        />
      )}

      {/* NDR Exception Modal */}
      {selectedOrderForNdr && (
        <NdrModal
          open={Boolean(selectedOrderForNdr)}
          order={selectedOrderForNdr}
          onClose={() => setSelectedOrderForNdr(null)}
          onSuccess={() => {
            checkAuthAndLoad();
          }}
        />
      )}
    </div>
  );
}

