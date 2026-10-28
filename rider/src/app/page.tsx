"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LOGO } from "@/lib/brand";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { ParcelCard, type ParcelItem } from "@/components/parcel-card";
import { EpodModal } from "@/components/epod-modal";
import { NdrModal } from "@/components/ndr-modal";
import {
  IconTruck,
  IconLogOut,
  IconRefresh,
  IconCash,
  IconSearch,
  IconCheck,
  IconMapPin,
  IconShieldCheck,
} from "@/components/icons";

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
      } else {
        setTrip(null);
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

  const progressPercent = useMemo(() => {
    if (!metrics.totalParcels) return 0;
    return Math.round((metrics.deliveredParcels / metrics.totalParcels) * 100);
  }, [metrics.deliveredParcels, metrics.totalParcels]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-[#070b14] overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="mt-4 font-mono text-xs font-semibold tracking-wider text-slate-400">
            CONNECTING DISPATCH TELEMETRY...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-28 bg-[#070b14] text-slate-200">
      {/* Ambient Royal Blue Glow Backdrop */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-40 right-0 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[110px]" />

      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#070b14]/85 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] p-1.5 shadow-sm">
              <Image
                src={LOGO.sm}
                alt="Agentic Rider"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="font-display text-xs font-extrabold tracking-tight text-white">
                  {driverName}
                </h2>
              </div>
              <p className="font-mono text-[10px] text-slate-400">
                {vehicleNumber || driverPhone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 transition active:scale-[0.98]"
            title="Sign out of shift"
          >
            <IconLogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* PWA Install Banner */}
      <div className="mx-auto max-w-lg">
        <PwaInstallBanner />
      </div>

      <main className="mx-auto max-w-lg p-4 space-y-4">
        {!trip ? (
          /* Empty State: No Active Run-Sheet */
          <div className="royal-card mt-8 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-400 shadow-inner">
              <IconTruck className="h-7 w-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                <span>STANDBY MODE</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-white">
                No Active Run-Sheet
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                No parcel manifest has been assigned to your driver ID ({driverPhone}). Once the sorting hub dispatches your route, it will stream here in real time.
              </p>
            </div>

            <button
              type="button"
              onClick={checkAuthAndLoad}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-display text-xs font-bold text-white shadow-xl shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              <IconRefresh className="h-3.5 w-3.5" />
              <span>Sync Run-Sheet</span>
            </button>
          </div>
        ) : (
          <>
            {/* Shift Summary Card */}
            <div className="royal-card rounded-3xl p-5 shadow-2xl space-y-4">
              {/* Trip Identity & Vehicle Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black tracking-wider text-white">
                      {trip.tripNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      IN TRANSIT
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <IconMapPin className="h-3 w-3 text-slate-500" />
                    <span>Origin: <strong className="text-slate-300">{trip.originHub}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-bold text-slate-300">
                    {trip.vehicleNumber || "ASSIGNED"}
                  </span>
                </div>
              </div>

              {/* Shift Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-slate-400">Route Completion</span>
                  <span className="font-bold text-blue-400">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 3-Column Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Total
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-black text-white">
                    {metrics.totalParcels}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-2.5 text-center">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    Delivered
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-black text-emerald-400">
                    {metrics.deliveredParcels}
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-2.5 text-center">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-blue-400">
                    Pending
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-black text-blue-400">
                    {metrics.pendingParcels}
                  </p>
                </div>
              </div>

              {/* COD Cash Remittance Card */}
              <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
                    <IconCash className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400/90">
                      Cash Collected (In-Hand)
                    </span>
                    <p className="font-mono text-base font-black text-amber-300">
                      ₹{metrics.deliveredCod.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] font-semibold text-slate-400">
                    Pending COD
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-200">
                    ₹{metrics.pendingCod.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Pills & Live Search */}
            <div className="space-y-2">
              <div className="flex rounded-2xl border border-white/[0.08] bg-[#0c1222] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setFilter("PENDING")}
                  className={`flex-1 rounded-xl py-2 font-display text-xs font-bold transition ${
                    filter === "PENDING"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pending ({metrics.pendingParcels})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("DELIVERED")}
                  className={`flex-1 rounded-xl py-2 font-display text-xs font-bold transition ${
                    filter === "DELIVERED"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Delivered ({metrics.deliveredParcels})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`flex-1 rounded-xl py-2 font-display text-xs font-bold transition ${
                    filter === "ALL"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All ({metrics.totalParcels})
                </button>
              </div>

              {/* Search Field */}
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <IconSearch className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search recipient, AWB, or locality..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Consignment Feed */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="royal-card rounded-2xl p-8 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400">
                    <IconShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="font-display text-xs font-bold text-white">
                    {filter === "PENDING"
                      ? "All Route Deliveries Completed"
                      : "No Consignments Match Filter"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {filter === "PENDING"
                      ? "Every consignment on this manifest has been delivered or logged with POD proof."
                      : "Try clearing your search query or switching tabs."}
                  </p>
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

      {/* Floating Bottom Sticky Bar */}
      {trip && (
        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-white/[0.08] bg-[#070b14]/90 px-5 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-400">
                <IconCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Shift Progress
                </p>
                <p className="font-mono text-xs font-extrabold text-white">
                  {metrics.deliveredParcels} of {metrics.totalParcels} Completed
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400/90">
                Cash Remittance
              </p>
              <p className="font-mono text-sm font-black text-amber-300">
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
