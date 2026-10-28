"use client";

import { useState } from "react";
import { compressImageToWebP } from "@/lib/image-compression";
import { SignaturePad } from "./signature-pad";
import { IconCamera, IconCross, IconCheck, IconShieldCheck, IconCash } from "./icons";

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
  "Recipient (Self)",
  "Family Member",
  "Security Gate",
  "Reception Desk",
];

export function EpodModal({ open, order, onClose, onSuccess }: EpodModalProps) {
  const [receivedBy, setReceivedBy] = useState("Recipient (Self)");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);

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
      setError(`Please confirm cash collection of ₹${order.totalAmount.toLocaleString("en-IN")}`);
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
        throw new Error(json.error || "Failed to submit delivery verification.");
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
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-white/[0.1] bg-[#0c1222] p-5 shadow-2xl sm:rounded-3xl sm:border">
        {/* Mobile handle indicator */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700 sm:hidden" />

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center gap-1 rounded bg-blue-500/10 px-2 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                <IconShieldCheck className="h-3 w-3" />
                Digital e-POD
              </span>
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
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          {/* COD Cash Collection Alert */}
          {isCod && (
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <IconCash className="h-3 w-3" />
                    Cash Collection Due
                  </span>
                  <p className="mt-0.5 font-mono text-2xl font-black text-amber-300">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-200">
                  <input
                    type="checkbox"
                    checked={codConfirmed}
                    onChange={(e) => setCodConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-500/50 bg-black/40 text-amber-500 focus:ring-0"
                  />
                  <span>Cash Collected</span>
                </label>
              </div>
            </div>
          )}

          {/* Handover Recipient */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Parcel Received By</label>
            <div className="grid grid-cols-2 gap-2">
              {RECEIVED_BY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReceivedBy(opt)}
                  className={`rounded-xl border py-2 px-3 text-xs font-semibold transition ${
                    receivedBy === opt
                      ? "border-blue-500/60 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/40"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Doorstep Camera Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Doorstep Package Photo (Verification Proof)
            </label>

            {photoPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.1]">
                <img src={photoPreview} alt="e-POD Verification" className="h-36 w-full object-cover" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-md">
                  <IconCheck className="h-3 w-3" />
                  <span>Compressed WebP · {photoSizeKb} KB</span>
                </div>
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
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.12] bg-white/[0.02] p-4 transition hover:border-blue-500/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <IconCamera className="h-5 w-5" />
                </div>
                <span className="mt-2 font-display text-xs font-bold text-slate-200">
                  {compressing ? "Optimizing image..." : "Take Doorstep Photo"}
                </span>
                <span className="text-[10px] text-slate-500">Auto-compressed WebP format</span>
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

          {/* Signature Pad */}
          <SignaturePad onSignatureChange={setSignatureData} />

          {/* Remark Input */}
          <input
            type="text"
            placeholder="Handover remarks (e.g. Left with security at building entrance)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || (isCod && !codConfirmed)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-display text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <span>Recording e-POD telemetry...</span>
            ) : (
              <>
                <IconCheck className="h-4 w-4" />
                <span>Confirm Delivery & Close Parcel</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
