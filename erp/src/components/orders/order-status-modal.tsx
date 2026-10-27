"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatus } from "@prisma/client";
import type { OrderItem } from "@/app/orders/orders-client";
import { compressImageToWebP } from "@/lib/image-compression";

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

function getStepPhotoDetails(status: OrderStatus) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return {
        title: "Proof of Delivery (e-POD) Photo",
        hint: "Customer signature, doorstep package handover, or gate receiving receipt",
        badge: "e-POD Verification",
      };
    case OrderStatus.IN_TRANSIT:
      return {
        title: "Linehaul Loading / Seal Verification Photo",
        hint: "Truck container seal number or sorting conveyor handoff proof",
        badge: "Transit Verification",
      };
    case OrderStatus.OUT_FOR_DELIVERY:
      return {
        title: "Courier Dispatch / Run-sheet Photo",
        hint: "Delivery associate vehicle loading or dispatch desk handover",
        badge: "Dispatch Verification",
      };
    case OrderStatus.CANCELLED:
    case OrderStatus.RTO:
      return {
        title: "NDR / Exception Evidence Photo",
        hint: "Damaged packaging, gate refusal, or wrong address proof",
        badge: "Exception Evidence",
      };
    default:
      return {
        title: "Milestone Verification Photo",
        hint: "Visual proof of status progression or package checkpoint",
        badge: "Checkpoint Photo",
      };
  }
}

export function OrderStatusModal({ open, order, onClose, onUpdated }: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status ?? OrderStatus.CONFIRMED);
  const [deliveryNotes, setDeliveryNotes] = useState(order?.deliveryNotes ?? "");
  const [ndrReason, setNdrReason] = useState(order?.ndrReason ?? NDR_REASONS[0]);
  const [customNdrNotes, setCustomNdrNotes] = useState("");
  const [location, setLocation] = useState(order ? `${order.receiverCity} Hub` : "Operational Hub");

  const [stepPhoto, setStepPhoto] = useState<{
    dataUrl: string;
    base64: string;
    sizeBytes: number;
    fileName: string;
    originalSizeBytes?: number;
  } | null>(null);
  const [stepPhotoCaption, setStepPhotoCaption] = useState("");
  const [compressingImage, setCompressingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }

    try {
      setCompressingImage(true);
      setImageError(null);
      const compressed = await compressImageToWebP(file, 800, 0.75);
      setStepPhoto({
        ...compressed,
        originalSizeBytes: file.size,
      });
    } catch (err) {
      console.error("Compression failed", err);
      setImageError("Failed to compress image. Please try another photo.");
    } finally {
      setCompressingImage(false);
    }
  }

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
          stepPhotoBase64: stepPhoto?.dataUrl,
          stepPhotoName: stepPhoto?.fileName,
          stepPhotoCaption: stepPhotoCaption.trim() || undefined,
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
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1.5">
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

        {/* Milestone Verification Photo Upload */}
        {(() => {
          const photoMeta = getStepPhotoDetails(selectedStatus);
          return (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {photoMeta.title}
                    </span>
                    <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.2 text-[9px] font-bold text-[var(--primary)]">
                      {photoMeta.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted)]">
                    {photoMeta.hint}
                  </p>
                </div>
                {stepPhoto && (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    Photo Attached
                  </span>
                )}
              </div>

              {imageError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-[11px] text-rose-600 dark:text-rose-400">
                  {imageError}
                </div>
              )}

              {stepPhoto ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stepPhoto.dataUrl}
                      alt="Milestone Step Proof"
                      className="h-14 w-14 rounded-lg object-cover border border-[var(--border)] shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">{stepPhoto.fileName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {(stepPhoto.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStepPhoto(null)}
                      className="btn btn-ghost text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={stepPhotoCaption}
                    onChange={(e) => setStepPhotoCaption(e.target.value)}
                    placeholder="Photo notes / reference (e.g. Gate Pass #, Recipient Name, or Seal ID)"
                    className="input text-xs h-8"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-3.5 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]/20 cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={compressingImage}
                    className="hidden"
                  />
                  {compressingImage ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--primary)]">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                      Processing photo...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--primary)] hover:underline">
                          Attach Verification Photo
                        </span>
                        <span className="text-xs text-[var(--muted)]"> (Optional)</span>
                      </div>
                      <p className="text-[10px] text-[var(--muted)]">
                        Upload image or take photo with device camera
                      </p>
                    </div>
                  )}
                </label>
              )}
            </div>
          );
        })()}

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
