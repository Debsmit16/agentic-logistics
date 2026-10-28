"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { DispatchStatus, DispatchType } from "@prisma/client";

interface DispatchStatusModalProps {
  open: boolean;
  dispatch: {
    id: string;
    tripNumber: string;
    status: DispatchStatus;
    type: DispatchType;
    driverName: string;
    vehicleNumber: string;
    orderCount?: number;
  } | null;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_DETAILS: Record<
  DispatchStatus,
  { label: string; badge: string; color: string; desc: string }
> = {
  [DispatchStatus.DRAFT]: {
    label: "Draft Run-Sheet",
    badge: "DRAFT",
    color: "border-slate-500/30 text-slate-400 bg-slate-500/10",
    desc: "Shipment manifest under preparation. Orders remain in their current stage until dispatched.",
  },
  [DispatchStatus.DISPATCHED]: {
    label: "Dispatched / On Trip",
    badge: "DISPATCHED",
    color: "border-sky-500/30 text-sky-400 bg-sky-500/10",
    desc: "Vehicle has departed depot. Orders automatically transition to Out for Delivery (Last-Mile) or In Transit (Linehaul).",
  },
  [DispatchStatus.COMPLETED]: {
    label: "Trip Completed & Reconciled",
    badge: "COMPLETED",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    desc: "Trip has returned or reached destination. Cash and deliveries successfully reconciled.",
  },
  [DispatchStatus.CANCELLED]: {
    label: "Trip Cancelled",
    badge: "CANCELLED",
    color: "border-rose-500/30 text-rose-400 bg-rose-500/10",
    desc: "Trip is called off. All attached orders are unassigned and returned to the ready pool.",
  },
};

export function DispatchStatusModal({ open, dispatch, onClose, onUpdated }: DispatchStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<DispatchStatus>(dispatch?.status ?? DispatchStatus.DRAFT);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!dispatch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/dispatches/${dispatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update trip status.");
      }

      onUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Trip Status: ${dispatch.tripNumber}`}
      description={`${dispatch.vehicleNumber} · ${dispatch.driverName} (${dispatch.orderCount ?? 0} packages)`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-medium text-rose-500">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Select Next Operational Status
          </label>
          <div className="space-y-2">
            {(Object.keys(STATUS_DETAILS) as DispatchStatus[]).map((st) => {
              const info = STATUS_DETAILS[st];
              const isSelected = selectedStatus === st;
              const isCurrent = dispatch.status === st;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                      : "border-[var(--border)] bg-[var(--surface-raised)]/40 hover:bg-[var(--surface-raised)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${info.color}`}>
                        {info.badge}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text)]">{info.label}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-[var(--muted)] italic">Current</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">{info.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transition Impact Warning */}
        {selectedStatus === DispatchStatus.DISPATCHED && dispatch.status === DispatchStatus.DRAFT && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-400">
            <strong>System Automated Action:</strong> Confirming dispatch will transition all{" "}
            {dispatch.orderCount ?? 0} linked consignments to{" "}
            <strong>
              {dispatch.type === DispatchType.LAST_MILE ? "OUT FOR DELIVERY" : "IN TRANSIT"}
            </strong>{" "}
            and record audit milestones.
          </div>
        )}

        {selectedStatus === DispatchStatus.CANCELLED && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <strong>Caution:</strong> Cancelling this trip will detach all {dispatch.orderCount ?? 0} consignments
            and place them back in the ready dispatch pool for rescheduling.
          </div>
        )}

        {/* Remark Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)]">Status Remark (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Departed depot on schedule with sealed cargo"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={submitting || selectedStatus === dispatch.status}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

