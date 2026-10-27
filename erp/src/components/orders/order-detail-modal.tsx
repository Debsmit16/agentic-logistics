"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { IconPencil, IconPrinter, IconTrash } from "@/components/icons/nav-icons";

export interface OrderAttachmentItem {
  id: string;
  type: "ORDER_REGISTRATION" | "MILESTONE_STEP";
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  caption?: string | null;
  createdAt: string;
}

export interface OrderMilestoneItem {
  id: string;
  status: OrderStatus;
  title: string;
  description?: string | null;
  location?: string | null;
  performedBy?: string | null;
  attachments?: OrderAttachmentItem[];
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  awbNumber: string;
  status: OrderStatus;
  paymentMode: PaymentMode;
  serviceType: ServiceType;

  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;

  itemDescription: string;
  packageWeight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumetricWeight: number;
  chargeableWeight: number;

  totalAmount: number;
  declaredValue: number;

  deliveryNotes?: string | null;
  ndrReason?: string | null;
  thirdPartyName?: string | null;
  thirdPartyTracking?: string | null;
  milestones?: OrderMilestoneItem[];
  attachments?: OrderAttachmentItem[];

  createdAt: string;
  createdBy?: { id: string; displayName: string; email: string } | null;
}

interface OrderDetailModalProps {
  open: boolean;
  order: OrderDetail | null;
  canUpdate: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (order: OrderDetail) => void;
  onDelete: (order: OrderDetail) => void;
  onPrintLetterhead: (order: OrderDetail) => void;
}

const STATUS_STEPS: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

function statusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case OrderStatus.IN_TRANSIT:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case OrderStatus.HANDED_TO_THIRD_PARTY:
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case OrderStatus.DELIVERED:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case OrderStatus.CANCELLED:
    case OrderStatus.RTO:
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
}

export function OrderDetailModal({
  open,
  order,
  canUpdate,
  canDelete,
  onClose,
  onEdit,
  onDelete,
  onPrintLetterhead,
}: OrderDetailModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<OrderAttachmentItem | null>(null);

  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const milestones = order.milestones ?? [];
  const registrationPhoto = order.attachments?.find((a) => a.type === "ORDER_REGISTRATION") || order.attachments?.[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Consignment ${order.orderNumber}`}
      description={`AWB: ${order.awbNumber} · Booked on ${new Date(order.createdAt).toLocaleDateString()}`}
      wide
    >
      <div className="space-y-6">
        {/* Status Badge & Service Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}
            >
              {order.status === OrderStatus.HANDED_TO_THIRD_PARTY ? "Handed to Third-Party" : order.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {order.serviceType.replace(/_/g, " ")} · {order.paymentMode}
            </span>
          </div>

          <div className="text-xs text-[var(--muted)]">
            AWB: <strong className="text-[var(--text)] font-mono">{order.awbNumber}</strong>
          </div>
        </div>

        {/* Third-Party Partner Handoff Banner (if applicable) */}
        {(order.status === OrderStatus.HANDED_TO_THIRD_PARTY || order.thirdPartyName) && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                3PL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text)]">
                    External Carrier Handoff: {order.thirdPartyName || "Third-Party Logistics"}
                  </span>
                  <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Partner Network
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  Consignment handed off to partner platform for linehaul routing and final mile delivery.
                </p>
              </div>
            </div>

            {order.thirdPartyTracking && (
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Carrier Ref / AWB</span>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white/70 dark:bg-slate-900/70 px-2.5 py-1 rounded-md border border-indigo-500/20 inline-block mt-0.5">
                  {order.thirdPartyTracking}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Consignment Parcel Registration Photo Banner (if present) */}
        {registrationPhoto && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setSelectedPhoto(registrationPhoto)}
                className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-black/5 hover:opacity-90 transition-all"
                title="Click to view full photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/attachments/${registrationPhoto.id}`}
                  alt="Registered Consignment Parcel"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </button>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text)]">Consignment Registration Parcel Photo</span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {(registrationPhoto.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] truncate max-w-md">
                  {registrationPhoto.caption || registrationPhoto.fileName}
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  Captured during booking · Click to inspect full resolution
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPhoto(registrationPhoto)}
              className="btn btn-ghost text-xs text-[var(--primary)] border border-[var(--border)] shrink-0"
            >
              View Photo
            </button>
          </div>
        )}

        {/* Lifecycle Progress Bar */}
        {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.RTO && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
              Shipment Pipeline Progress
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <div
                      className={`h-2 w-full rounded-full transition-colors ${
                        isPassed ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                      }`}
                    />
                    <span
                      className={`mt-2 text-[10px] ${
                        isCurrent
                          ? "font-bold text-[var(--primary)]"
                          : isPassed
                          ? "font-medium text-[var(--text)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {step.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Milestone Tracking History Timeline (Point 1) */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Milestone Tracking History & Chain of Custody
              </span>
              <p className="text-[11px] text-[var(--muted)]">
                Chronological transit checkpoints and operational events
              </p>
            </div>
            <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
              {milestones.length} Checkpoints
            </span>
          </div>

          {milestones.length === 0 ? (
            <div className="py-4 text-center text-xs text-[var(--muted)]">
              No historical milestones logged for this consignment yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
              {milestones.map((m, idx) => {
                const isLatest = idx === milestones.length - 1;
                const isDelivered = m.status === OrderStatus.DELIVERED;
                const isFailed = m.status === OrderStatus.CANCELLED || m.status === OrderStatus.RTO;

                return (
                  <div key={m.id} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                        isDelivered
                          ? "border-emerald-500 text-emerald-500"
                          : isFailed
                          ? "border-rose-500 text-rose-500"
                          : isLatest
                          ? "border-blue-500 bg-blue-500 text-white animate-pulse"
                          : "border-slate-400 text-slate-400"
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isDelivered
                            ? "bg-emerald-500"
                            : isFailed
                            ? "bg-rose-500"
                            : isLatest
                            ? "bg-blue-500"
                            : "bg-slate-400"
                        }`}
                      />
                    </div>

                    {/* Milestone Details */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-3 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-[var(--text)] font-semibold">{m.title}</strong>
                          <span
                            className={`rounded-full border px-2 py-0.2 text-[9px] font-bold ${statusColor(
                              m.status,
                            )}`}
                          >
                            {m.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--muted)] font-mono">
                          {new Date(m.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {m.description && (
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                          {m.description}
                        </p>
                      )}

                      {/* Milestone Step Verification Photo Proofs */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1 pb-1">
                          {m.attachments.map((att) => (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() => setSelectedPhoto(att)}
                              className="group/photo relative flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]/20 transition-all text-left"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/api/attachments/${att.id}`}
                                alt={att.caption || att.fileName}
                                className="h-11 w-11 rounded-lg object-cover border border-[var(--border)] shrink-0"
                                loading="lazy"
                              />
                              <div className="text-[10px] space-y-0.5 pr-2">
                                <div className="flex items-center gap-1 font-semibold text-[var(--text)] group-hover/photo:text-[var(--primary)]">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                  </svg>
                                  <span>Step Verification Photo</span>
                                </div>
                                <p className="text-[var(--muted)] truncate max-w-[150px]">{att.caption || att.fileName}</p>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px]">
                                  {(att.sizeBytes / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--muted)] border-t border-[var(--border)]/40">
                        <span>Hub: <strong className="text-[var(--text)]">{m.location || "In Transit"}</strong></span>
                        <span>Logged by: <strong className="text-[var(--text)]">{m.performedBy || "System Dispatcher"}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sender & Receiver Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Origin */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Shipper / Origin
              </span>
              <span className="text-xs font-semibold text-[var(--text)]">{order.senderCity}</span>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-[var(--text)]">{order.senderName}</p>
              <p className="text-[var(--muted)]">{order.senderPhone}</p>
              <p className="text-[var(--muted)] leading-relaxed">{order.senderAddress}</p>
              <p className="text-[var(--muted)]">
                {order.senderCity}, {order.senderState} - {order.senderPincode}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Consignee / Destination
              </span>
              <span className="text-xs font-semibold text-[var(--text)]">{order.receiverCity}</span>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-[var(--text)]">{order.receiverName}</p>
              <p className="text-[var(--muted)]">{order.receiverPhone}</p>
              <p className="text-[var(--muted)] leading-relaxed">{order.receiverAddress}</p>
              <p className="text-[var(--muted)]">
                {order.receiverCity}, {order.receiverState} - {order.receiverPincode}
              </p>
            </div>
          </div>
        </div>

        {/* Package & Volumetric Weight Telemetry */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/20 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Package & Dimensional Telemetry
            </span>
            <span className="text-xs font-medium text-[var(--muted)]">{order.itemDescription}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
              <span className="text-[10px] uppercase text-[var(--muted)]">Dimensions</span>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {order.lengthCm} × {order.widthCm} × {order.heightCm} cm
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
              <span className="text-[10px] uppercase text-[var(--muted)]">Dead Weight</span>
              <p className="mt-1 font-semibold text-[var(--text)]">{order.packageWeight} kg</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
              <span className="text-[10px] uppercase text-[var(--muted)]">Volumetric</span>
              <p className="mt-1 font-semibold text-[var(--text)]">{order.volumetricWeight} kg</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-soft)] p-2.5">
              <span className="text-[10px] font-bold uppercase text-[var(--primary)]">Chargeable</span>
              <p className="mt-1 font-bold text-[var(--primary)]">{order.chargeableWeight} kg</p>
            </div>
          </div>
        </div>

        {/* Financials & Commercials */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Payment Mode</span>
            <p className="mt-1 text-sm font-bold text-[var(--text)]">{order.paymentMode}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Freight Tariff</span>
            <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ₹{order.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Declared Value</span>
            <p className="mt-1 text-sm font-bold text-[var(--text)]">
              ₹{order.declaredValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintLetterhead(order)}
              className="btn btn-ghost text-xs"
              title="Print Internal Consignment Note & Audit Manifest on Company Letterhead"
            >
              <IconPrinter className="h-4 w-4" />
              Print Internal Manifest (Letterhead)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canUpdate && (
              <button
                type="button"
                onClick={() => onEdit(order)}
                className="btn btn-ghost text-xs text-[var(--primary)]"
              >
                <IconPencil className="h-3.5 w-3.5" />
                Edit Consignment
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(order)}
                className="btn btn-ghost text-xs text-rose-600 dark:text-rose-400"
              >
                <IconTrash className="h-3.5 w-3.5" />
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / High-Res Image Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {selectedPhoto.type === "ORDER_REGISTRATION" ? "Parcel Registration Photo" : "Milestone Step Proof"}
                </span>
                <span className="text-xs font-mono text-slate-300 truncate max-w-xs">
                  {selectedPhoto.fileName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/api/attachments/${selectedPhoto.id}`}
                  target="_blank"
                  rel="noreferrer"
                  download={selectedPhoto.fileName}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="relative flex-1 flex items-center justify-center p-4 bg-black/50 overflow-auto min-h-[320px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/attachments/${selectedPhoto.id}`}
                alt={selectedPhoto.caption || selectedPhoto.fileName}
                className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>

            {/* Footer with Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5 bg-slate-950/70 text-xs text-slate-400">
              <div>
                {selectedPhoto.caption && (
                  <p className="text-white font-medium mb-0.5">{selectedPhoto.caption}</p>
                )}
                <span className="text-[11px] text-slate-400">
                  Logged on {new Date(selectedPhoto.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-300 font-medium">
                  {(selectedPhoto.sizeBytes / 1024).toFixed(1)} KB
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-400 font-medium">High Resolution Photo</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
