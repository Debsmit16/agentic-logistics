"use client";

import { Modal } from "@/components/ui/modal";
import { OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { IconPencil, IconPrinter, IconTrash } from "@/components/icons/nav-icons";

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
  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

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
              {order.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {order.serviceType.replace(/_/g, " ")} · {order.paymentMode}
            </span>
          </div>

          <div className="text-xs text-[var(--muted)]">
            AWB: <strong className="text-[var(--text)] font-mono">{order.awbNumber}</strong>
          </div>
        </div>

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
                        isPassed
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--border)]"
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
    </Modal>
  );
}
