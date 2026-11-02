"use client";

import { useState } from "react";
import Link from "next/link";

interface NdrOrder {
  id: string;
  awbNumber: string;
  orderNumber: string;
  status: string;
  ndrReason: string;
  receiverName: string;
  receiverPhone: string;
  receiverCity: string;
  receiverPincode: string;
  receiverAddress: string;
  paymentMode: string;
  totalAmount: number;
  packageWeight: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  tripNumber: string;
  latestMilestone: string | null;
  updatedAt: string;
}

export function NdrClient({ initialOrders }: { initialOrders: NdrOrder[] }) {
  const [orders, setOrders] = useState<NdrOrder[]>(initialOrders);
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<NdrOrder | null>(null);
  const [modalAction, setModalAction] = useState<"RESCHEDULE" | "RTO" | null>(null);

  // Form states for action modal
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split("T")[0];
  });
  const [rescheduleSlot, setRescheduleSlot] = useState("MORNING");
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick metrics
  const totalExceptions = orders.length;
  const customerReschedules = orders.filter((o) =>
    o.ndrReason.toLowerCase().includes("reschedule")
  ).length;
  const rtoCount = orders.filter((o) => o.status === "RTO").length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (filter === "RESCHEDULE") return o.ndrReason.toLowerCase().includes("reschedule");
    if (filter === "RTO") return o.status === "RTO";
    if (filter === "UNAVAILABLE") return o.ndrReason.toLowerCase().includes("unavailable");
    return true;
  });

  async function handleQuickReattempt(order: NdrOrder) {
    if (!confirm(`Clear NDR exception and re-attempt delivery tomorrow for ${order.awbNumber}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/ndr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          action: "REATTEMPT",
          notes: "Dispatcher approved next-day delivery re-attempt.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setToastMessage(`✓ ${order.awbNumber} successfully re-queued for delivery attempt.`);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error executing action");
    }
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder || !modalAction) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ndr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          action: modalAction,
          preferredDate: modalAction === "RESCHEDULE" ? rescheduleDate : undefined,
          preferredSlot: modalAction === "RESCHEDULE" ? rescheduleSlot : undefined,
          notes: actionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setToastMessage(`✓ ${data.result.message}`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: modalAction === "RTO" ? "RTO" : "CONFIRMED",
                ndrReason:
                  modalAction === "RTO"
                    ? "Return to Origin (RTO)"
                    : `Rescheduled for ${rescheduleDate} (${rescheduleSlot})`,
              }
            : o
        )
      );

      setModalAction(null);
      setSelectedOrder(null);
      setActionNotes("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting action");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. Header & Quick Metrics ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              NDR Exception Resolution Center
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{totalExceptions} Active Exceptions</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time Non-Delivery Report governance, customer delivery slot self-rescheduling, and RTO prevention workflows.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: `All (${totalExceptions})` },
            { id: "RESCHEDULE", label: `Customer Rescheduled (${customerReschedules})` },
            { id: "UNAVAILABLE", label: "Unavailable / Unreachable" },
            { id: "RTO", label: `RTO Initiated (${rtoCount})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Toast Feedback ─── */}
      {toastMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ─── 2. NDR Exception Orders Table ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">
            No active delivery exceptions matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Consignment / Ref</th>
                  <th className="px-3 py-2.5">Recipient & Destination</th>
                  <th className="px-3 py-2.5">Assigned Courier Rider</th>
                  <th className="px-3 py-2.5">Exception Reason</th>
                  <th className="px-3 py-2.5">Payment</th>
                  <th className="px-3 py-2.5 text-right">Resolution Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {o.awbNumber}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {o.orderNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {o.receiverName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {o.receiverCity} ({o.receiverPincode}) · 📞 {o.receiverPhone}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {o.driverName}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Trip: {o.tripNumber || "—"} ({o.vehicleNumber || "—"})
                      </span>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          o.status === "RTO"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {o.ndrReason}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={o.paymentMode === "COD" ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                        {o.paymentMode} {o.paymentMode === "COD" ? `₹${o.totalAmount}` : ""}
                      </span>
                      <span className="text-slate-400 block text-[10px]">{o.packageWeight} kg</span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickReattempt(o)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                        title="Re-queue for delivery tomorrow"
                      >
                        ↻ Re-attempt
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(o);
                          setModalAction("RESCHEDULE");
                        }}
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        📅 Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(o);
                          setModalAction("RTO");
                        }}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        ↩ RTO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 3. Action Modal (Reschedule or RTO) ─── */}
      {selectedOrder && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalAction === "RESCHEDULE" ? "Reschedule Delivery Handover" : "Initiate Return to Origin (RTO)"}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Consignment: {selectedOrder.awbNumber} · {selectedOrder.receiverName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setModalAction(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalAction === "RESCHEDULE" ? (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Preferred Delivery Date:
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Delivery Time Window:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRescheduleSlot("MORNING")}
                        className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                          rescheduleSlot === "MORNING"
                            ? "border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        🌅 Morning (9 AM – 1 PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRescheduleSlot("AFTERNOON")}
                        className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                          rescheduleSlot === "AFTERNOON"
                            ? "border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        🌇 Afternoon (1 PM – 6 PM)
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-3 text-xs text-red-300">
                  ⚠️ This action flags the parcel for reverse logistics transport back to the consignor.
                  Ensure customer refusal or 3 failed attempts have been verified.
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Resolution Notes / Instructions:
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter remarks or customer instructions..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setModalAction(null);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition-all ${
                    modalAction === "RTO"
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {isSubmitting
                    ? "Updating..."
                    : modalAction === "RTO"
                    ? "Confirm RTO Return"
                    : "Confirm Reschedule Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

