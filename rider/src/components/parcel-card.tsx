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
          ? "border-emerald-200 bg-emerald-50/40"
          : "royal-card bg-white border-slate-200 hover:border-blue-400 shadow-sm hover:shadow"
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header Row: Sequence, AWB & Payment Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-7 items-center justify-center rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-600">
              {seq}
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-800">
              {order.awbNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isCod ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-800">
                <IconCash className="h-3 w-3 text-amber-700" />
                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Prepaid
              </span>
            )}

            {isDelivered && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                <IconCheck className="h-2.5 w-2.5" />
                <span>Delivered</span>
              </span>
            )}
          </div>
        </div>

        {/* Consignee Name & Destination */}
        <div>
          <h4 className="font-display text-sm font-bold text-slate-900 tracking-tight">
            {order.receiverName}
          </h4>
          <div className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-slate-600">
            <IconMapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-2">
              {order.receiverAddress}, {order.receiverCity} ({order.receiverPincode})
            </span>
          </div>
        </div>

        {/* Quick Contact & Directions Bar */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <a
            href={`tel:${order.receiverPhone}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <IconPhone className="h-3.5 w-3.5 text-blue-600" />
            <span>Call Customer</span>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <IconNavigation className="h-3.5 w-3.5 text-sky-600" />
            <span>Directions</span>
          </a>
        </div>

        {/* Delivery Execution Bar */}
        {!isDelivered && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onDeliver(order)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 font-display text-xs font-bold text-white shadow-md shadow-blue-600/15 transition active:scale-[0.98] cursor-pointer"
            >
              <IconCamera className="h-3.5 w-3.5" />
              <span>Deliver & e-POD</span>
            </button>
            <button
              type="button"
              onClick={() => onNdr(order)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-2.5 text-xs font-semibold text-rose-700 transition active:scale-[0.98] cursor-pointer"
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
