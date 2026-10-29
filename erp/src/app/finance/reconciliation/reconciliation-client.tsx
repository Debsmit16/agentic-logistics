"use client";

import { useState } from "react";
import { printIsolatedElement } from "@/lib/print-utils";
import type { SettlementData, SettlementDenominations } from "@/lib/finance/settlement-service";

interface TripOrder {
  id: string;
  awbNumber: string;
  orderNumber: string;
  status: string;
  paymentMode: string;
  totalAmount: number;
  receiverName: string;
  receiverCity: string;
  receiverPincode: string;
}

interface TripItem {
  id: string;
  tripNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  status: string;
  originHub: string;
  createdAt: string;
  updatedAt: string;
  totalStops: number;
  deliveredCount: number;
  ndrCount: number;
  codOrderCount: number;
  totalCodExpected: number;
  isReconciled: boolean;
  settlement: SettlementData | null;
  orders: TripOrder[];
}

interface RemittanceItem {
  orderId: string;
  awbNumber: string;
  orderNumber: string;
  merchantName: string;
  originCity: string;
  recipientName: string;
  destinationCity: string;
  deliveredAt: string;
  grossCod: number;
  freightFee: number;
  codHandlingFee: number;
  gst18: number;
  totalDeductions: number;
  netPayout: number;
  status: string;
}

export function ReconciliationClient({
  initialTrips,
  initialRemittances,
}: {
  initialTrips: TripItem[];
  initialRemittances: RemittanceItem[];
}) {
  const [activeTab, setActiveTab] = useState<"RECONCILIATION" | "REMITTANCE" | "INVOICES">(
    "RECONCILIATION"
  );
  const [trips, setTrips] = useState<TripItem[]>(initialTrips);
  const [remittances] = useState<RemittanceItem[]>(initialRemittances);

  // Selected trip for active reconciliation
  const pendingTrips = trips.filter((t) => !t.isReconciled);
  const [selectedTripId, setSelectedTripId] = useState<string>(
    pendingTrips[0]?.id || trips[0]?.id || ""
  );

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Denomination state
  const [d500, setD500] = useState(0);
  const [d200, setD200] = useState(0);
  const [d100, setD100] = useState(0);
  const [d50, setD50] = useState(0);
  const [d20, setD20] = useState(0);
  const [d10, setD10] = useState(0);
  const [customCash, setCustomCash] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  // Calculated cash received
  const calculatedFromNotes =
    d500 * 500 + d200 * 200 + d100 * 100 + d50 * 50 + d20 * 20 + d10 * 10;
  const cashReceived = customCash !== "" ? Number(customCash) || 0 : calculatedFromNotes;
  const expectedCash = selectedTrip?.totalCodExpected || 0;
  const variance = cashReceived - expectedCash;

  // Print targets
  const [printReceiptTrip, setPrintReceiptTrip] = useState<TripItem | null>(null);
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<RemittanceItem | null>(null);

  // Metrics
  const totalCit = trips
    .filter((t) => !t.isReconciled)
    .reduce((sum, t) => sum + t.totalCodExpected, 0);
  const totalReconciledToday = trips
    .filter((t) => t.isReconciled)
    .reduce((sum, t) => sum + (t.settlement?.cashReceived || t.totalCodExpected), 0);
  const totalMerchantPayable = remittances.reduce((sum, r) => sum + r.netPayout, 0);

  async function handleReconcileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTrip) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/finance/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          cashReceived,
          denominations: {
            n500: d500,
            n200: d200,
            n100: d100,
            n50: d50,
            n20: d20,
            n10: d10,
          },
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reconcile trip");
      }

      setStatusMessage({ text: data.result.message });

      // Update local state
      setTrips((prev) =>
        prev.map((t) =>
          t.id === selectedTrip.id
            ? {
                ...t,
                status: "COMPLETED",
                isReconciled: true,
                settlement: data.result.settlement,
              }
            : t
        )
      );

      // Offer receipt print
      const updatedTrip = {
        ...selectedTrip,
        status: "COMPLETED",
        isReconciled: true,
        settlement: data.result.settlement,
      };
      setPrintReceiptTrip(updatedTrip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting settlement";
      setStatusMessage({ text: msg, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTriggerReceiptPrint(trip: TripItem) {
    setPrintReceiptTrip(trip);
    setTimeout(() => {
      printIsolatedElement("cash-handover-receipt-hidden", "a4");
    }, 150);
  }

  function handleTriggerInvoicePrint(remittance: RemittanceItem) {
    setPrintInvoiceOrder(remittance);
    setTimeout(() => {
      printIsolatedElement("gst-tax-invoice-hidden", "a4");
    }, 150);
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. Header & Financial Overview ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Finance & Cash Settlement
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Audit Ledger Synced</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            End-of-day driver physical cash handover reconciliation, merchant COD remittance payouts, and official GST freight tax invoices.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("RECONCILIATION")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "RECONCILIATION"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            💵 Driver Cash Settlement
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REMITTANCE")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "REMITTANCE"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🏦 Merchant COD Remittance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INVOICES")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "INVOICES"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🧾 GST Tax Invoices
          </button>
        </div>
      </div>

      {/* ─── 2. Financial KPI Metric Strip ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Cash-in-Transit (CIT in Fleet)
          </span>
          <div className="mt-1 font-display text-2xl font-black text-amber-500">
            ₹{totalCit.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Pending driver handovers across {pendingTrips.length} active runsheet{pendingTrips.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Total Reconciled & Deposited Today
          </span>
          <div className="mt-1 font-display text-2xl font-black text-emerald-500">
            ₹{totalReconciledToday.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Verified by hub cashier with signed e-POD audit backing
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Net Merchant Remittance Pool
          </span>
          <div className="mt-1 font-display text-2xl font-black text-blue-600 dark:text-blue-400">
            ₹{totalMerchantPayable.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Ready for automated NEFT/RTGS batch bank payout
          </p>
        </div>
      </div>

      {/* ─── TAB 1: DRIVER CASH SETTLEMENT ─── */}
      {activeTab === "RECONCILIATION" && (
        <div className="space-y-6">
          {/* Active Reconciler Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Driver Runsheet Selector & Details */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Select Driver Runsheet Trip
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => {
                    setSelectedTripId(e.target.value);
                    setCustomCash("");
                    setD500(0);
                    setD200(0);
                    setD100(0);
                    setD50(0);
                    setD20(0);
                    setD10(0);
                    setStatusMessage(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tripNumber} — {t.driverName} ({t.vehicleNumber}) [
                      {t.isReconciled ? "✓ Reconciled" : `Pending ₹${t.totalCodExpected}`}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedTrip && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {selectedTrip.tripNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        selectedTrip.isReconciled
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {selectedTrip.isReconciled ? "✓ Settled & Reconciled" : "● Settlement Due"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Driver:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedTrip.driverName} ({selectedTrip.driverPhone})
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Vehicle:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                        {selectedTrip.vehicleNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Stops:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedTrip.totalStops} (Delivered: {selectedTrip.deliveredCount}, NDR: {selectedTrip.ndrCount})
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Expected COD Cash:</span>
                      <div className="font-extrabold text-amber-500 text-sm mt-0.5">
                        ₹{selectedTrip.totalCodExpected.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Consignment Stops in this Trip */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">
                      COD Deliveries in this Trip:
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedTrip.orders
                        .filter((o) => o.paymentMode === "COD")
                        .map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700/60 text-[11px]"
                          >
                            <div>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {o.awbNumber}
                              </span>
                              <span className="text-slate-400 block text-[10px]">
                                {o.receiverName} ({o.receiverCity})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-500">₹{o.totalAmount}</span>
                              <span
                                className={`block text-[9px] font-semibold ${
                                  o.status === "DELIVERED" ? "text-emerald-500" : "text-amber-500"
                                }`}
                              >
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Cash Counting & Variance Reconciler */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Cash Handover Reconciler
                </h3>
                <span className="text-xs text-slate-400">
                  Denomination Breakdown or Direct Cash Input
                </span>
              </div>

              {selectedTrip?.isReconciled ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">This Runsheet is Reconciled & Closed</h4>
                    <p className="mt-1 text-xs text-slate-300">
                      Reconciled by <strong>{selectedTrip.settlement?.reconciledByName}</strong> on{" "}
                      {new Date(selectedTrip.settlement?.settledAt || "").toLocaleString("en-IN")}.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 bg-white/5 rounded-xl p-3 text-xs max-w-md mx-auto">
                    <div>
                      <span className="text-slate-400 text-[10px]">Expected:</span>
                      <div className="font-bold text-white mt-0.5">₹{selectedTrip.settlement?.cashExpected}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Received:</span>
                      <div className="font-bold text-emerald-400 mt-0.5">₹{selectedTrip.settlement?.cashReceived}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Variance:</span>
                      <div className="font-bold text-white mt-0.5">₹{selectedTrip.settlement?.variance}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerReceiptPrint(selectedTrip)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all"
                  >
                    <span>🖨️ Print Cash Handover Receipt</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReconcileSubmit} className="space-y-4">
                  {/* Denomination Counter Grid */}
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Count Physical Currency Notes:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: "₹500 Notes", value: d500, setter: setD500, multiplier: 500 },
                        { label: "₹200 Notes", value: d200, setter: setD200, multiplier: 200 },
                        { label: "₹100 Notes", value: d100, setter: setD100, multiplier: 100 },
                        { label: "₹50 Notes", value: d50, setter: setD50, multiplier: 50 },
                        { label: "₹20 Notes", value: d20, setter: setD20, multiplier: 20 },
                        { label: "₹10 Notes", value: d10, setter: setD10, multiplier: 10 },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              = ₹{(item.value * item.multiplier).toLocaleString()}
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={item.value || ""}
                            onChange={(e) => {
                              item.setter(Math.max(0, parseInt(e.target.value) || 0));
                              setCustomCash("");
                            }}
                            placeholder="0"
                            className="w-14 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Or Direct Input */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-slate-400">or Direct Total Amount:</span>
                    <input
                      type="number"
                      min="0"
                      value={customCash}
                      onChange={(e) => setCustomCash(e.target.value)}
                      placeholder={`e.g. ${expectedCash}`}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                    />
                  </div>

                  {/* Live Variance Calculation Banner */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Expected COD</span>
                        <div className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                          ₹{expectedCash.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Deposited Cash</span>
                        <div className="font-extrabold text-base text-emerald-500 mt-0.5">
                          ₹{cashReceived.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Variance</span>
                        <div
                          className={`font-extrabold text-base mt-0.5 ${
                            variance === 0
                              ? "text-emerald-500"
                              : variance < 0
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}
                        >
                          {variance === 0 ? "₹0 (Balanced)" : `${variance > 0 ? "+" : ""}₹${variance}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cashier Notes */}
                  <div>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional Cashier Notes / Verification remarks"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Feedback Message */}
                  {statusMessage && (
                    <div
                      className={`rounded-xl p-3 text-xs font-semibold ${
                        statusMessage.isError
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      }`}
                    >
                      {statusMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTrip}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? "Reconciling..." : "Confirm Cash Handover & Close Trip"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Settled Runsheets History Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Reconciled Runsheet Archive
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Trip Number</th>
                    <th className="px-3 py-2.5">Driver & Vehicle</th>
                    <th className="px-3 py-2.5">Expected</th>
                    <th className="px-3 py-2.5">Received</th>
                    <th className="px-3 py-2.5">Variance</th>
                    <th className="px-3 py-2.5">Cashier Sign-Off</th>
                    <th className="px-3 py-2.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trips
                    .filter((t) => t.isReconciled)
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {t.tripNumber}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.driverName}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-400">
                            {t.vehicleNumber}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{t.settlement?.cashExpected.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-emerald-500">
                          ₹{t.settlement?.cashReceived.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold">
                          {t.settlement?.variance === 0 ? (
                            <span className="text-emerald-500">₹0 Balanced</span>
                          ) : (
                            <span className="text-amber-500">₹{t.settlement?.variance}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-500">
                          <span>{t.settlement?.reconciledByName}</span>
                          <span className="block text-[10px] text-slate-400">
                            {new Date(t.settlement?.settledAt || "").toLocaleDateString("en-IN")}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleTriggerReceiptPrint(t)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            🖨️ Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MERCHANT COD REMITTANCE ─── */}
      {activeTab === "REMITTANCE" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Merchant COD Remittance Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Delivered COD consignments with automated freight deductions, COD handling fees, and GST breakdown.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Automated NEFT Batch Payout initiated for eligible merchants.")}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
              >
                Execute Bank NEFT Batch Payout →
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">AWB / Ref</th>
                    <th className="px-3 py-2.5">Merchant / Shipper</th>
                    <th className="px-3 py-2.5">Gross COD</th>
                    <th className="px-3 py-2.5">Freight Fee</th>
                    <th className="px-3 py-2.5">COD Fee (1.5%)</th>
                    <th className="px-3 py-2.5">GST (18%)</th>
                    <th className="px-3 py-2.5 font-bold">Net Payout</th>
                    <th className="px-3 py-2.5 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {remittances.map((r) => (
                    <tr key={r.orderId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {r.awbNumber}
                        <span className="block text-[10px] text-slate-400">{r.orderNumber}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {r.merchantName}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Dest: {r.destinationCity}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-500">
                        ₹{r.grossCod.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500">
                        -₹{r.freightFee}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500">
                        -₹{r.codHandlingFee}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500">
                        -₹{r.gst18}
                      </td>
                      <td className="px-3 py-3 font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        ₹{r.netPayout.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerInvoicePrint(r)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          🧾 Tax Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: GST FREIGHT INVOICES ─── */}
      {activeTab === "INVOICES" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              GST Compliant Freight Tax Invoices (SAC 9965)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Automated CGST (9%) + SGST (9%) or IGST (18%) freight invoicing on company letterhead for B2B billing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {remittances.map((r) => (
                <div
                  key={r.orderId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      INV-{r.awbNumber.replace("AWB-", "")}
                    </span>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Merchant: <strong>{r.merchantName}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      SAC: 9965 · Freight Value: ₹{r.freightFee} + GST: ₹{r.gst18}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerInvoicePrint(r)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all"
                  >
                    <span>🖨️ Print A4 Invoice</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. Hidden Isolated Print: Cash Handover Receipt (A4 Letterhead) ─── */}
      {printReceiptTrip && (
        <div style={{ display: "none" }}>
          <div
            id="cash-handover-receipt-hidden"
            style={{
              width: "194mm",
              margin: "0 auto",
              padding: "16px",
              fontFamily: 'Arial, Helvetica, "Liberation Sans", sans-serif',
              fontSize: "12px",
              lineHeight: "1.4",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "1px" }}>AGENTIC LOGISTICS ENTERPRISE</div>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#444" }}>OFFICIAL HUB CASH HANDOVER RECONCILIATION RECEIPT</div>
                <div style={{ fontSize: "10px", color: "#666" }}>Hub: {printReceiptTrip.originHub} | GSTIN: 27AABCA1234F1Z8</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", fontWeight: "bold", fontFamily: "monospace" }}>REF: STL-{printReceiptTrip.tripNumber}</div>
                <div style={{ fontSize: "10px", color: "#666" }}>Date: {new Date(printReceiptTrip.settlement?.settledAt || "").toLocaleString("en-IN")}</div>
              </div>
            </div>

            {/* Driver & Trip Details */}
            <div style={{ display: "flex", border: "1px solid #000", padding: "8px", marginBottom: "12px", backgroundColor: "#f9f9f9" }}>
              <div style={{ flex: 1 }}>
                <div><strong>Driver Name:</strong> {printReceiptTrip.driverName}</div>
                <div><strong>Driver Contact:</strong> {printReceiptTrip.driverPhone}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div><strong>Vehicle Number:</strong> {printReceiptTrip.vehicleNumber}</div>
                <div><strong>Runsheet Trip:</strong> {printReceiptTrip.tripNumber}</div>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div><strong>Total Stops:</strong> {printReceiptTrip.totalStops}</div>
                <div><strong>Delivered COD:</strong> {printReceiptTrip.codOrderCount} stops</div>
              </div>
            </div>

            {/* Reconciliation Financial Summary */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
              <thead>
                <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "11px" }}>Description</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: "11px" }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "6px 8px" }}>Total COD Cash Expected (from delivered e-PODs)</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>₹{printReceiptTrip.settlement?.cashExpected.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "6px 8px" }}>Physical Cash Deposited & Counted by Cashier</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold", color: "#008000" }}>₹{printReceiptTrip.settlement?.cashReceived.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: "2px solid #000", backgroundColor: "#f0f0f0" }}>
                  <td style={{ padding: "6px 8px", fontWeight: "bold" }}>Cash Settlement Variance (Shortage / Excess)</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>
                    {printReceiptTrip.settlement?.variance === 0 ? "₹0 (BALANCED)" : `₹${printReceiptTrip.settlement?.variance}`}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Signatures */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", paddingTop: "12px" }}>
              <div style={{ width: "220px", borderTop: "1px solid #000", textAlign: "center", fontSize: "11px" }}>
                Driver Signature<br />
                <strong>{printReceiptTrip.driverName}</strong>
              </div>
              <div style={{ width: "220px", borderTop: "1px solid #000", textAlign: "center", fontSize: "11px" }}>
                Cashier / Supervisor Signature<br />
                <strong>{printReceiptTrip.settlement?.reconciledByName}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. Hidden Isolated Print: GST Tax Invoice (A4 Letterhead) ─── */}
      {printInvoiceOrder && (
        <div style={{ display: "none" }}>
          <div
            id="gst-tax-invoice-hidden"
            style={{
              width: "194mm",
              margin: "0 auto",
              padding: "16px",
              fontFamily: 'Arial, Helvetica, "Liberation Sans", sans-serif',
              fontSize: "12px",
              lineHeight: "1.4",
              color: "#000000",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "1px" }}>AGENTIC LOGISTICS ENTERPRISE</div>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#333" }}>TAX INVOICE · TRANSPORTATION OF GOODS (SAC 9965)</div>
                <div style={{ fontSize: "10px", color: "#666" }}>Andheri East, Mumbai, Maharashtra 400093 | GSTIN: 27AABCA1234F1Z8</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "monospace" }}>INV-{printInvoiceOrder.awbNumber}</div>
                <div style={{ fontSize: "10px", color: "#666" }}>Date: {new Date().toLocaleDateString("en-IN")}</div>
              </div>
            </div>

            {/* Billed To / Merchant */}
            <div style={{ border: "1px solid #000", padding: "8px", marginBottom: "16px", backgroundColor: "#fafafa" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#666" }}>BILLED TO (CONSIGNOR):</div>
              <div style={{ fontSize: "13px", fontWeight: "bold" }}>{printInvoiceOrder.merchantName}</div>
              <div style={{ fontSize: "11px" }}>Origin: {printInvoiceOrder.originCity} | Waybill Ref: {printInvoiceOrder.awbNumber}</div>
            </div>

            {/* Freight & Tax Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                  <th style={{ padding: "6px", textAlign: "left", fontSize: "11px" }}>Service Description</th>
                  <th style={{ padding: "6px", textAlign: "center", fontSize: "11px" }}>SAC Code</th>
                  <th style={{ padding: "6px", textAlign: "right", fontSize: "11px" }}>Taxable Value</th>
                  <th style={{ padding: "6px", textAlign: "right", fontSize: "11px" }}>CGST (9%)</th>
                  <th style={{ padding: "6px", textAlign: "right", fontSize: "11px" }}>SGST (9%)</th>
                  <th style={{ padding: "6px", textAlign: "right", fontSize: "11px" }}>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "6px" }}>Express Highway Cargo & Last-Mile Delivery</td>
                  <td style={{ padding: "6px", textAlign: "center", fontFamily: "monospace" }}>9965</td>
                  <td style={{ padding: "6px", textAlign: "right" }}>₹{printInvoiceOrder.freightFee}</td>
                  <td style={{ padding: "6px", textAlign: "right" }}>₹{(printInvoiceOrder.gst18 / 2).toFixed(2)}</td>
                  <td style={{ padding: "6px", textAlign: "right" }}>₹{(printInvoiceOrder.gst18 / 2).toFixed(2)}</td>
                  <td style={{ padding: "6px", textAlign: "right", fontWeight: "bold" }}>₹{printInvoiceOrder.freightFee + printInvoiceOrder.gst18}</td>
                </tr>
                <tr style={{ borderBottom: "2px solid #000", backgroundColor: "#f9f9f9" }}>
                  <td colSpan={5} style={{ padding: "6px", fontWeight: "bold", textAlign: "right" }}>Net Invoice Amount:</td>
                  <td style={{ padding: "6px", textAlign: "right", fontWeight: "900", fontSize: "13px" }}>₹{printInvoiceOrder.freightFee + printInvoiceOrder.gst18}</td>
                </tr>
              </tbody>
            </table>

            {/* Company Bank & Remittance details */}
            <div style={{ border: "1px dashed #666", padding: "8px", fontSize: "10px", color: "#444" }}>
              <strong>Bank Remittance Details:</strong> HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123 | Branch: Andheri East, Mumbai
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
