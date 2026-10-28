"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { DispatchStatus, DispatchType } from "@prisma/client";
import { DispatchPrintModal } from "./dispatch-print-modal";
import { DispatchStatusModal } from "./dispatch-status-modal";

export interface DispatchOrderDetail {
  id: string;
  orderNumber: string;
  awbNumber: string;
  status: string;
  senderName: string;
  senderCity: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;
  packageWeight: number;
  totalAmount: number;
  paymentMode: string;
  serviceType: string;
}

export interface DispatchDetail {
  id: string;
  tripNumber: string;
  type: DispatchType;
  status: DispatchStatus;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originHub: string;
  destinationHub?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id?: string;
    displayName?: string;
    name?: string;
    email?: string;
  } | null;
  orders: DispatchOrderDetail[];
}

interface DispatchDetailModalProps {
  open: boolean;
  dispatch: DispatchDetail | null;
  onClose: () => void;
  onRefresh: () => void;
  canManage?: boolean;
}

export function DispatchDetailModal({
  open,
  dispatch,
  onClose,
  onRefresh,
  canManage = true,
}: DispatchDetailModalProps) {
  const [printOpen, setPrintOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [searchParcel, setSearchParcel] = useState("");

  const filteredOrders = useMemo(() => {
    if (!dispatch?.orders) return [];
    if (!searchParcel.trim()) return dispatch.orders;
    const q = searchParcel.toLowerCase();
    return dispatch.orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.awbNumber.toLowerCase().includes(q) ||
        o.receiverName.toLowerCase().includes(q) ||
        o.receiverCity.toLowerCase().includes(q) ||
        o.receiverPincode.includes(q)
    );
  }, [dispatch, searchParcel]);

  if (!dispatch) return null;

  const totalWeight = dispatch.orders.reduce((sum, o) => sum + (Number(o.packageWeight) || 0), 0);
  const codOrders = dispatch.orders.filter((o) => o.paymentMode === "COD");
  const totalCod = codOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const statusBadge = (st: DispatchStatus) => {
    switch (st) {
      case DispatchStatus.DRAFT:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      case DispatchStatus.DISPATCHED:
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case DispatchStatus.COMPLETED:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case DispatchStatus.CANCELLED:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Trip Manifest: ${dispatch.tripNumber}`}
        description={`${dispatch.type === DispatchType.LAST_MILE ? "Last-Mile Delivery" : "Linehaul Transfer"} · Created ${new Date(dispatch.createdAt).toLocaleString()}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Top Actions & Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadge(dispatch.status)}`}>
                {dispatch.status}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {dispatch.type === DispatchType.LAST_MILE ? "Doorstep Run-Sheet" : "Inter-Hub Linehaul"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface-raised)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Run-Sheet</span>
              </button>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setStatusOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-emerald-500"
                >
                  <span>Update Status</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Consignments</span>
              <p className="mt-1 text-xl font-extrabold text-[var(--text)]">{dispatch.orders.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Gross Weight</span>
              <p className="mt-1 text-xl font-extrabold text-[var(--text)]">{totalWeight.toFixed(2)} <span className="text-xs font-normal text-[var(--muted)]">kg</span></p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">COD Collections</span>
              <p className="mt-1 text-xl font-extrabold text-amber-500">₹{totalCod.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Prepaid / Nil</span>
              <p className="mt-1 text-xl font-extrabold text-emerald-500">{dispatch.orders.length - codOrders.length}</p>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Vehicle</span>
              <p className="mt-0.5 font-mono font-bold text-[var(--text)]">{dispatch.vehicleNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Driver & Contact</span>
              <p className="mt-0.5 font-semibold text-[var(--text)]">{dispatch.driverName}</p>
              <p className="font-mono text-[11px] text-[var(--muted)]">{dispatch.driverPhone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Routing Route</span>
              <p className="mt-0.5 font-semibold text-[var(--text)]">{dispatch.originHub}</p>
              <p className="text-[11px] text-[var(--muted)]">→ {dispatch.destinationHub || "Delivery Zone"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Dispatcher</span>
              <p className="mt-0.5 font-semibold text-[var(--text)]">{dispatch.createdBy?.displayName || dispatch.createdBy?.name || "System"}</p>
              <p className="text-[11px] text-[var(--muted)]">{dispatch.notes || "No notes recorded"}</p>
            </div>
          </div>

          {/* Assigned Consignments Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Assigned Consignments ({dispatch.orders.length})
              </h4>
              <input
                type="text"
                placeholder="Search parcels by AWB, order #, consignee..."
                value={searchParcel}
                onChange={(e) => setSearchParcel(e.target.value)}
                className="w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-raised)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">AWB / Order</th>
                    <th className="py-2.5 px-3">Consignee & Destination</th>
                    <th className="py-2.5 px-3 text-right">Weight</th>
                    <th className="py-2.5 px-3 text-right">Payment</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-xs text-[var(--muted)]">
                        No consignments match the query.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord, idx) => (
                      <tr key={ord.id} className="transition hover:bg-[var(--surface-raised)]/40">
                        <td className="py-2.5 px-3 text-[var(--muted)] font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-[var(--text)]">{ord.awbNumber}</div>
                          <div className="text-[10px] text-[var(--muted)]">{ord.orderNumber}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[var(--text)]">{ord.receiverName}</div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {ord.receiverCity}, {ord.receiverState} ({ord.receiverPincode})
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[var(--text)]">
                          {Number(ord.packageWeight).toFixed(2)} kg
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-mono font-semibold text-[var(--text)]">
                            {ord.paymentMode === "COD" ? `₹${ord.totalAmount}` : "Prepaid"}
                          </div>
                          <div className="text-[10px] text-[var(--muted)]">{ord.paymentMode}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            {ord.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Printable Run-Sheet Modal */}
      {printOpen && (
        <DispatchPrintModal
          open={printOpen}
          dispatch={dispatch}
          onClose={() => setPrintOpen(false)}
        />
      )}

      {/* Status Update Modal */}
      {statusOpen && (
        <DispatchStatusModal
          open={statusOpen}
          dispatch={{
            id: dispatch.id,
            tripNumber: dispatch.tripNumber,
            status: dispatch.status,
            type: dispatch.type,
            driverName: dispatch.driverName,
            vehicleNumber: dispatch.vehicleNumber,
            orderCount: dispatch.orders.length,
          }}
          onClose={() => setStatusOpen(false)}
          onUpdated={() => {
            onRefresh();
            onClose();
          }}
        />
      )}
    </>
  );
}
