"use client";

import { useState } from "react";
import { compressImageToWebP } from "@/lib/image-compression";
import { IconAlertTriangle, IconCamera, IconCross } from "./icons";

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
  "Customer Unreachable / Phone Switched Off",
  "Customer Requested Delivery Reschedule",
  "Incomplete Address / Landmark Missing",
  "Doorstep Closed / Premises Locked",
  "Customer Refused Delivery / Cash Not Ready",
  "Restricted Entry / Gate Security Denied",
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
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-white/[0.1] bg-[#0c1222] p-5 shadow-2xl sm:rounded-3xl sm:border">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700 sm:hidden" />

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              <span>Non-Delivery Exception (NDR)</span>
            </div>
            <h3 className="mt-1 font-display text-base font-bold text-white tracking-tight">
              {order.receiverName}
            </h3>
            <p className="font-mono text-xs text-slate-400">AWB: {order.awbNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-slate-400 hover:text-white"
          >
            <IconCross className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-semibold">
              {error}
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Select Reason for Incomplete Delivery
            </label>
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
                        : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reschedule Date */}
          {selectedReason.includes("Reschedule") && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Requested Reschedule Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          )}

          {/* Evidence Photo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Evidence Photo (Locked Door / Gate)
            </label>
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.1]">
                <img src={photoPreview} alt="NDR Evidence" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoBase64(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-rose-400"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] py-3 text-xs font-semibold text-rose-400 hover:border-rose-500/50">
                <IconCamera className="h-4 w-4" />
                <span>{compressing ? "Compressing..." : "Capture Doorstep Evidence"}</span>
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
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-rose-600 py-3.5 font-display text-sm font-bold text-white shadow-xl shadow-rose-600/25 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Logging Exception..." : "Submit Non-Delivery Exception"}
          </button>
        </form>
      </div>
    </div>
  );
}
