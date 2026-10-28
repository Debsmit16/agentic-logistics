"use client";

import { useState } from "react";
import { compressImageToWebP } from "@/lib/image-compression";
import { SignaturePad } from "./signature-pad";

interface EpodModalProps {
  open: boolean;
  order: {
    id: string;
    orderNumber: string;
    awbNumber: string;
    receiverName: string;
    paymentMode: string;
    totalAmount: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RECEIVED_BY_OPTIONS = [
  "Customer (Self)",
  "Family Member",
  "Security Guard",
  "Reception / Office",
];

export function EpodModal({ open, order, onClose, onSuccess }: EpodModalProps) {
  const [receivedBy, setReceivedBy] = useState("Customer (Self)");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Photo capture state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);

  // COD state
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !order) return null;

  const isCod = order.paymentMode === "COD";

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError(null);
    try {
      const res = await compressImageToWebP(file, 800, 0.75);
      setPhotoPreview(res.dataUrl);
      setPhotoBase64(res.base64);
      setPhotoSizeKb(Math.round(res.sizeBytes / 1024));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compress photo.");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isCod && !codConfirmed) {
      setError(`Please confirm cash collection of ₹${order.totalAmount}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivedBy,
          signatureBase64: signatureData || undefined,
          photoBase64: photoBase64 || undefined,
          codCollected: isCod,
          codAmount: isCod ? order.totalAmount : 0,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit delivery.");
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
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:rounded-3xl sm:border">
        {/* Drag handle pill */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-700 sm:hidden" />

        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Electronic Proof of Delivery
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

          {/* COD Cash Collection Alert */}
          {isCod && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Cash On Delivery (COD)
                  </span>
                  <p className="text-xl font-black text-amber-400">₹{order.totalAmount}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300">
                  <input
                    type="checkbox"
                    checked={codConfirmed}
                    onChange={(e) => setCodConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Cash Received</span>
                </label>
              </div>
            </div>
          )}

          {/* Received By Relationship Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Parcel Handed Over To</label>
            <div className="grid grid-cols-2 gap-2">
              {RECEIVED_BY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReceivedBy(opt)}
                  className={`rounded-xl border py-2 px-2.5 text-xs font-semibold transition ${
                    receivedBy === opt
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-[var(--border)] bg-[var(--surface-raised)]/40 text-[var(--text-muted)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Doorstep Photo Capture */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Doorstep / Gate Photo (Optional e-POD)
            </label>

            {photoPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/40">
                <img src={photoPreview} alt="e-POD Preview" className="h-32 w-full object-cover" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur-sm">
                  <span>✓ WebP {photoSizeKb} KB</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoBase64(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-rose-400"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-raised)]/30 p-4 transition hover:border-emerald-500">
                <span className="text-2xl">📸</span>
                <span className="mt-1 text-xs font-bold text-emerald-400">
                  {compressing ? "Compressing WebP..." : "Tap to Open Camera"}
                </span>
                <span className="text-[10px] text-slate-500">Doorstep package proof</span>
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

          {/* Recipient Digital Signature */}
          <SignaturePad onSignatureChange={setSignatureData} />

          {/* Optional Note */}
          <input
            type="text"
            placeholder="Optional handover remarks (e.g. Left with guard on 2nd floor)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || (isCod && !codConfirmed)}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Recording e-POD..." : "✓ Confirm & Mark Delivered"}
          </button>
        </form>
      </div>
    </div>
  );
}

