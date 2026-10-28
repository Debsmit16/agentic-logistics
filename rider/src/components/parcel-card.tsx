"use client";

import {
  IconPhone,
  IconNavigation,
  IconCamera,
  IconAlertTriangle,
  IconCheck,
  IconMapPin,
  IconCash,
} from "./icons";

export interface ParcelItem {
  id: string;
  orderNumber: string;
  awbNumber: string;
  status: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;
  itemDescription?: string | null;
  packageWeight: number;
  paymentMode: string;
  totalAmount: number;
}

interface ParcelCardProps {
  order: ParcelItem;
  index: number;
  onDeliver: (order: ParcelItem) => void;
  onNdr: (order: ParcelItem) => void;
}

export function ParcelCard({ order, index, onDeliver, onNdr }: ParcelCardProps) {
  const isDelivered = order.status === "DELIVERED";
  const isCod = order.paymentMode === "COD";

  const fullAddress = `${order.receiverAddress}, ${order.receiverCity} ${order.receiverPincode}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  // Formatted sequence string (e.g. 01, 02)
  const seq = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        isDelivered
          ? "border-emerald-500/20 bg-[#0a121e]/60 opacity-80"
          : "royal-card hover:border-blue-500/30"
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header Row: Sequence, AWB & Payment Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-7 items-center justify-center rounded-md bg-white/[0.05] border border-white/[0.08] font-mono text-[10px] font-bold text-slate-400">
              {seq}
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-300">
              {order.awbNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isCod ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-300">
                <IconCash className="h-3 w-3 text-amber-400" />
                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Prepaid
              </span>
            )}

            {isDelivered && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <IconCheck className="h-2.5 w-2.5" />
                <span>Delivered</span>
              </span>
            )}
          </div>
        </div>

        {/* Consignee Name & Destination */}
        <div>
          <h4 className="font-display text-sm font-bold text-white tracking-tight">
            {order.receiverName}
          </h4>
          <div className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
            <IconMapPin className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" />
            <span className="line-clamp-2">
              {order.receiverAddress}, {order.receiverCity} ({order.receiverPincode})
            </span>
          </div>
        </div>

        {/* Quick Contact & Directions Bar */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3">
          <a
            href={`tel:${order.receiverPhone}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <IconPhone className="h-3.5 w-3.5 text-blue-400" />
            <span>Call Customer</span>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <IconNavigation className="h-3.5 w-3.5 text-sky-400" />
            <span>Directions</span>
          </a>
        </div>

        {/* Delivery Execution Bar */}
        {!isDelivered && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onDeliver(order)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-display text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98]"
            >
              <IconCamera className="h-3.5 w-3.5" />
              <span>Deliver & e-POD</span>
            </button>
            <button
              type="button"
              onClick={() => onNdr(order)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 active:scale-[0.98]"
              title="Report Non-Delivery Reason"
            >
              <IconAlertTriangle className="h-3.5 w-3.5" />
              <span>Issue</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
