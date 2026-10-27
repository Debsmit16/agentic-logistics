"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatus } from "@prisma/client";

interface OrderBatchStatusModalProps {
  open: boolean;
  orderIds: string[];
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_OPTIONS = [
  { value: OrderStatus.CONFIRMED, label: "Confirmed", desc: "Ready for shipper pickup" },
  { value: OrderStatus.IN_TRANSIT, label: "In Transit", desc: "Moving in primary linehaul network" },
  { value: OrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery", desc: "Assigned to courier run-sheet" },
  { value: OrderStatus.DELIVERED, label: "Delivered", desc: "All selected consignments delivered" },
  { value: OrderStatus.RTO, label: "Return to Origin", desc: "Return packages to shipper facility" },
  { value: OrderStatus.CANCELLED, label: "Cancelled", desc: "Cancel selected consignments" },
];

export function OrderBatchStatusModal({ open, orderIds, onClose, onUpdated }: OrderBatchStatusModalProps) {
  const [targetStatus, setTargetStatus] = useState<OrderStatus>(OrderStatus.IN_TRANSIT);
  const [location, setLocation] = useState("Kolkata Sorting Hub");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (orderIds.length === 0) return null;

  async function handleBatchUpdate() {
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds,
          status: targetStatus,
          location: location.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update batch status");

      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch update failed");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !updating && onClose()}
      title={`Batch Status Update (${orderIds.length} Consignments)`}
      description="Apply a common status transition and milestone across all selected consignments."
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Target Lifecycle Status
          </label>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {STATUS_OPTIONS.map((opt) => {
              const active = targetStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetStatus(opt.value)}
                  className={`flex w-full items-start justify-between rounded-xl border p-2.5 text-left transition-all ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-raised)]"
                  }`}
                >
                  <div>
                    <span className={`text-xs font-bold ${active ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>
                      {opt.label}
                    </span>
                    <p className="text-[10px] text-[var(--muted)]">{opt.desc}</p>
                  </div>
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--border)] mt-0.5">
                    {active && <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
            Check-in Location / Hub
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kolkata Sorting Hub, Salt Lake Delivery Center"
            className="input text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
            Batch Dispatch Remarks (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Linehaul batch transfer vehicle WB-04-1234"
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
            onClick={handleBatchUpdate}
            disabled={updating}
            className="btn btn-primary text-xs"
          >
            {updating ? "Updating Batch…" : `Update ${orderIds.length} Consignments`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
