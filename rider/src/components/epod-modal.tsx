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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl sm:rounded-3xl sm:border text-slate-900">
        {/* Mobile handle indicator */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                <IconShieldCheck className="h-3 w-3" />
                Digital e-POD
              </span>
            </div>
            <h3 className="mt-1 font-display text-base font-bold text-slate-900 tracking-tight">
              {order.receiverName}
            </h3>
            <p className="font-mono text-xs text-slate-500">AWB: {order.awbNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <IconCross className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* COD Cash Collection Alert */}
          {isCod && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    <IconCash className="h-3 w-3" />
                    Cash Collection Due
                  </span>
                  <p className="mt-0.5 font-mono text-2xl font-black text-amber-900">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm">
                  <input
                    type="checkbox"
                    checked={codConfirmed}
                    onChange={(e) => setCodConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-0"
                  />
                  <span>Cash Collected</span>
                </label>
              </div>
            </div>
          )}

          {/* Handover Recipient */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Parcel Received By</label>
            <div className="grid grid-cols-2 gap-2">
              {RECEIVED_BY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReceivedBy(opt)}
                  className={`rounded-xl border py-2 px-3 text-xs font-semibold transition cursor-pointer ${
                    receivedBy === opt
                      ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Doorstep Camera Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Doorstep Package Photo (Verification Proof)
            </label>

            {photoPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200">
                <img src={photoPreview} alt="e-POD Verification" className="h-36 w-full object-cover" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-md">
                  <IconCheck className="h-3 w-3" />
                  <span>Compressed WebP · {photoSizeKb} KB</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoBase64(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-white/90 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-sm cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-blue-400 hover:bg-slate-100/70">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <IconCamera className="h-5 w-5" />
                </div>
                <span className="mt-2 font-display text-xs font-bold text-slate-800">
                  {compressing ? "Optimizing image..." : "Take Doorstep Photo"}
                </span>
                <span className="text-[10px] text-slate-400">Auto-compressed WebP format</span>
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
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || (isCod && !codConfirmed)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
