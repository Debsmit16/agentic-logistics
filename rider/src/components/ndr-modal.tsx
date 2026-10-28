"use client";

import { useState } from "react";
import { compressImageToWebP } from "@/lib/image-compression";

interface NdrModalProps {
  open: boolean;
  order: {
    id: string;
    orderNumber: string;
    awbNumber: string;
    receiverName: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const NDR_REASONS = [
  "Customer Unreachable / Phone Off",
  "Customer Requested Reschedule",
  "Incomplete Address / Landmark Missing",
  "Doorstep Closed / Premises Locked",
  "Refused Delivery / Cash Not Ready",
  "Restricted Entry / Gate Denied",
];

export function NdrModal({ open, order, onClose, onSuccess }: NdrModalProps) {
  const [selectedReason, setSelectedReason] = useState(NDR_REASONS[0]);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [notes, setNotes] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !order) return null;

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError(null);
    try {
      const res = await compressImageToWebP(file, 800, 0.75);
      setPhotoPreview(res.dataUrl);
      setPhotoBase64(res.base64);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compress photo.");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${order.id}/ndr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          rescheduleDate: rescheduleDate || undefined,
          photoBase64: photoBase64 || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to log delivery exception.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:rounded-3xl sm:border">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-700 sm:hidden" />

        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Non-Delivery Exception (NDR)
            </span>
            <h3 className="text-base font-extrabold text-[var(--text)]">{order.receiverName}</h3>
            <p className="font-mono text-xs text-[var(--text-muted)]">AWB: {order.awbNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-raised)] text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Select Reason for Incomplete Delivery</label>
            <div className="space-y-1.5">
              {NDR_REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`w-full rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                      isSelected
                        ? "border-rose-500/60 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30"
                        : "border-[var(--border)] bg-[var(--surface-raised)]/40 text-[var(--text-muted)] hover:bg-[var(--surface-raised)]"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reschedule Date if applicable */}
          {selectedReason.includes("Reschedule") && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Requested Reschedule Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs text-[var(--text)] focus:border-rose-500 focus:outline-none"
              />
            </div>
          )}

          {/* Evidence Photo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Evidence Photo (e.g. Locked Gate / Door)</label>
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-rose-500/40">
                <img src={photoPreview} alt="NDR Evidence" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoBase64(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-rose-400"
                >
                  Retake
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-raised)]/30 py-3 text-xs text-rose-400 hover:border-rose-500">
                <span>📸</span>
                <span>{compressing ? "Compressing..." : "Take Evidence Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Remarks */}
          <input
            type="text"
            placeholder="Additional remarks (e.g. Called customer 3 times, no answer)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-rose-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-rose-600 py-3 text-sm font-extrabold text-white shadow-xl shadow-rose-500/20 hover:bg-rose-500 disabled:opacity-50"
          >
            {submitting ? "Logging Exception..." : "Submit Delivery Exception"}
          </button>
        </form>
      </div>
    </div>
  );
}

