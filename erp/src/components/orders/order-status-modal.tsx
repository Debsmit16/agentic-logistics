"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatus } from "@prisma/client";
import type { OrderItem } from "@/app/orders/orders-client";

interface OrderStatusModalProps {
  open: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: "Initial draft shipment details recorded, pending confirmation.",
  [OrderStatus.CONFIRMED]: "Manifest booked and assigned to shipper pickup schedule.",
  [OrderStatus.IN_TRANSIT]: "Shipment moving between sorting hubs and primary linehaul.",
  [OrderStatus.OUT_FOR_DELIVERY]: "Assigned to last-mile courier run-sheet for delivery.",
  [OrderStatus.DELIVERED]: "Package successfully delivered and digital e-POD recorded.",
  [OrderStatus.CANCELLED]: "Consignment terminated prior to completion.",
  [OrderStatus.RTO]: "Failed delivery attempts; returning shipment to origin facility.",
};

const NDR_REASONS = [
  "Customer Unreachable / Phone Switched Off",
  "Incomplete Address / Landmark Missing",
  "Customer Requested Delivery Reschedule",
  "Refused Delivery / COD Cash Not Ready",
  "Package Damaged During Transit",
  "Restricted Delivery Area / Entry Denied",
  "Customer Cancelled Shipment",
];

export function OrderStatusModal({ open, order, onClose, onUpdated }: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status ?? OrderStatus.CONFIRMED);
  const [deliveryNotes, setDeliveryNotes] = useState(order?.deliveryNotes ?? "");
  const [ndrReason, setNdrReason] = useState(order?.ndrReason ?? NDR_REASONS[0]);
  const [customNdrNotes, setCustomNdrNotes] = useState("");
  const [location, setLocation] = useState(order ? `${order.receiverCity} Hub` : "Operational Hub");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  async function handleUpdate() {
    if (!order) return;
    setUpdating(true);
    setError(null);

    let finalNotes = deliveryNotes.trim();
    let finalNdr = ndrReason;
    if (selectedStatus === OrderStatus.CANCELLED || selectedStatus === OrderStatus.RTO) {
      if (customNdrNotes.trim()) {
        finalNdr = `${ndrReason} - ${customNdrNotes.trim()}`;
      }
    }

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          deliveryNotes: selectedStatus === OrderStatus.DELIVERED ? finalNotes : undefined,
          ndrReason:
            selectedStatus === OrderStatus.CANCELLED || selectedStatus === OrderStatus.RTO
              ? finalNdr
              : undefined,
          statusLocation: location.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update status");

      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !updating && onClose()}
      title="Update Shipment Status & Milestones"
      description={`Consignment ${order.orderNumber} (AWB: ${order.awbNumber})`}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Select Lifecycle Stage
          </label>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {Object.values(OrderStatus).map((status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`flex w-full items-start justify-between rounded-xl border p-2.5 text-left transition-all ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)]"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${active ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>
                        {status.replace(/_/g, " ")}
                      </span>
                      {order.status === status && (
                        <span className="rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-1.5 py-0.2 text-[9px] font-semibold text-[var(--muted)]">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                      {STATUS_DESCRIPTIONS[status]}
                    </p>
                  </div>
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--border)] mt-0.5">
                    {active && <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Context Fields based on selected status */}
        {selectedStatus === OrderStatus.DELIVERED && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                Proof of Delivery (POD) Capture
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-500">e-POD Audit</span>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--muted)] mb-1">
                Recipient Details / Delivery Remarks
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Received by Consignee (Signature & OTP Verified) or Security Gate"
                className="input text-xs"
              />
            </div>
          </div>
        )}

        {(selectedStatus === OrderStatus.CANCELLED || selectedStatus === OrderStatus.RTO) && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-700 dark:text-rose-400">
                Non-Delivery Report (NDR) Exception Code
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-500">Required</span>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--muted)] mb-1">Select Exception Reason</label>
              <select
                value={ndrReason}
                onChange={(e) => setNdrReason(e.target.value)}
                className="input text-xs"
              >
                {NDR_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--muted)] mb-1">Additional Exception Notes</label>
              <input
                type="text"
                value={customNdrNotes}
                onChange={(e) => setCustomNdrNotes(e.target.value)}
                placeholder="e.g. Called customer 3 times at 14:30; gate security refused package"
                className="input text-xs"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
            Current Operations Location / Hub
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kolkata Sorting Hub, Salt Lake Delivery Center"
            className="input text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="btn btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            className="btn btn-primary text-xs"
          >
            {updating ? "Recording Milestone…" : "Record Milestone & Update"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
