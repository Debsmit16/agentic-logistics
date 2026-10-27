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

export function OrderStatusModal({ open, order, onClose, onUpdated }: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status ?? OrderStatus.CONFIRMED);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  async function handleUpdate() {
    if (!order) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
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
      title="Update Shipment Status"
      description={`Consignment ${order.orderNumber} (AWB: ${order.awbNumber})`}
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Select Lifecycle Stage
          </label>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {Object.values(OrderStatus).map((status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`flex w-full items-start justify-between rounded-xl border p-3 text-left transition-all ${
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
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                      {STATUS_DESCRIPTIONS[status]}
                    </p>
                  </div>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border)] mt-0.5">
                    {active && <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
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
            disabled={updating || selectedStatus === order.status}
            className="btn btn-primary text-xs"
          >
            {updating ? "Updating…" : "Update Status"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
