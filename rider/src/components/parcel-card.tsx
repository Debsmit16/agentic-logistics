"use client";

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

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all shadow-sm ${
        isDelivered
          ? "border-emerald-500/30 bg-emerald-500/5 opacity-85"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-emerald-500/40"
      }`}
    >
      {/* Sequence Pill & Payment Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-raised)] font-mono text-xs font-bold text-[var(--text-muted)]">
            #{index + 1}
          </span>
          <span className="font-mono text-xs font-extrabold text-[var(--text)]">{order.awbNumber}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCod ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-black text-amber-400">
              <span>COD</span>
              <span>₹{order.totalAmount}</span>
            </span>
          ) : (
            <span className="inline-flex items-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
              Prepaid
            </span>
          )}

          {isDelivered && (
            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              ✓ DELIVERED
            </span>
          )}
        </div>
      </div>

      {/* Recipient Details */}
      <div className="mt-2.5">
        <h4 className="text-sm font-bold text-[var(--text)]">{order.receiverName}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">
          📍 {order.receiverAddress}, {order.receiverCity} ({order.receiverPincode})
        </p>
      </div>

      {/* Direct Contact & Navigation Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-2.5">
        <a
          href={`tel:${order.receiverPhone}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 py-2 text-xs font-bold text-[var(--text)] transition active:scale-95"
        >
          <span className="text-emerald-400 text-sm">📞</span>
          <span>Call Customer</span>
        </a>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 py-2 text-xs font-bold text-[var(--text)] transition active:scale-95"
        >
          <span className="text-sky-400 text-sm">🗺️</span>
          <span>Maps Route</span>
        </a>
      </div>

      {/* Primary Delivery Action Buttons */}
      {!isDelivered && (
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDeliver(order)}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-500 active:scale-95"
          >
            📸 Deliver & e-POD
          </button>
          <button
            type="button"
            onClick={() => onNdr(order)}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 active:scale-95"
            title="Mark Delivery Exception (NDR)"
          >
            Failed
          </button>
        </div>
      )}
    </div>
  );
}

