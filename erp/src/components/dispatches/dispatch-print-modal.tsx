"use client";

import { useRef } from "react";
import Image from "next/image";
import { SvgBarcode } from "@/components/orders/svg-barcode";
import { LOGO } from "@/lib/brand";

interface OrderManifestItem {
  id: string;
  orderNumber: string;
  awbNumber: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverPincode: string;
  itemDescription: string;
  packageWeight: number;
  paymentMode: string;
  totalAmount: number;
  status: string;
}

export interface DispatchPrintTrip {
  id: string;
  tripNumber: string;
  type: string;
  status: string;
  originHub: string;
  destinationHub?: string | null;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  notes?: string | null;
  createdAt: string | Date;
  orders: OrderManifestItem[];
  orderCount?: number;
  totalWeight?: number;
  totalCod?: number;
}

export function DispatchPrintModal({
  trip: initialTrip,
  dispatch,
  open = true,
  onClose,
}: {
  trip?: DispatchPrintTrip | null;
  dispatch?: any;
  open?: boolean;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const trip: DispatchPrintTrip | null = initialTrip || (dispatch ? {
    id: dispatch.id,
    tripNumber: dispatch.tripNumber,
    type: dispatch.type,
    status: dispatch.status,
    originHub: dispatch.originHub,
    destinationHub: dispatch.destinationHub,
    vehicleNumber: dispatch.vehicleNumber,
    driverName: dispatch.driverName,
    driverPhone: dispatch.driverPhone,
    notes: dispatch.notes,
    createdAt: dispatch.createdAt,
    orders: dispatch.orders || [],
    orderCount: dispatch.orders?.length ?? 0,
    totalWeight: dispatch.orders
      ? dispatch.orders.reduce((sum: number, o: any) => sum + (Number(o.packageWeight) || 0), 0)
      : 0,
    totalCod: dispatch.orders
      ? dispatch.orders
          .filter((o: any) => o.paymentMode === "COD")
          .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0)
      : 0,
  } : null);

  if (!open || !trip) return null;

  const formattedDate = new Date(trip.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalWeight = trip.totalWeight ?? trip.orders.reduce((sum, o) => sum + (Number(o.packageWeight) || 0), 0);
  const totalCod = trip.totalCod ?? trip.orders
    .filter((o) => o.paymentMode === "COD")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const orderCount = trip.orderCount ?? trip.orders.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl print:h-auto print:max-w-none print:border-none print:shadow-none print:rounded-none">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">Official Driver Delivery Run-Sheet</h2>
              <p className="text-xs text-[var(--muted)]">Trip #{trip.tripNumber} • Ready to Print</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Run-Sheet
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition-all hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-8 font-sans print:p-6 print:overflow-visible">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <Image src={LOGO.sm} alt="Agentic Logistics" width={40} height={40} className="object-contain" />
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                  AGENTIC LOGISTICS
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-slate-600">
                  {trip.type === "LAST_MILE" ? "Last-Mile Delivery Run-Sheet" : "Linehaul Transfer Manifest"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block">
                <SvgBarcode value={trip.tripNumber} height={32} className="w-36" />
              </div>
              <p className="font-mono text-xs font-bold text-slate-900 dark:text-white print:text-black">
                {trip.tripNumber}
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-600">Generated: {formattedDate}</p>
            </div>
          </div>

          {/* Dispatch Metadata Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/40 sm:grid-cols-4 print:border-slate-300 print:bg-slate-50 print:text-black">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle #</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                {trip.vehicleNumber}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Driver</span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">
                {trip.driverName}
              </span>
              <span className="block text-[10px] text-slate-500">{trip.driverPhone}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Route / Hubs</span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">
                {trip.originHub} → {trip.destinationHub || "Delivery Sector"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Consignments</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">
                {orderCount} Orders ({totalWeight.toFixed(2)} kg)
              </span>
              {totalCod > 0 && (
                <span className="block text-[10px] font-bold text-amber-600 print:text-black">
                  COD: ₹{totalCod.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Parcel Delivery Manifest Table */}
          <div className="mt-6">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-black">
              Consignment Delivery Checklist ({trip.orders.length} Parcels)
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-left text-xs print:border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-200 print:bg-slate-200 print:text-black">
                  <th className="border border-slate-300 p-2 w-8 text-center print:border-slate-400">#</th>
                  <th className="border border-slate-300 p-2 w-32 print:border-slate-400">AWB / Tracking</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400">Customer & Delivery Address</th>
                  <th className="border border-slate-300 p-2 w-20 text-center print:border-slate-400">Weight</th>
                  <th className="border border-slate-300 p-2 w-24 text-right print:border-slate-400">Payment</th>
                  <th className="border border-slate-300 p-2 w-36 text-center print:border-slate-400">
                    Recipient Sign / Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {trip.orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-200 hover:bg-slate-50/50 print:border-slate-300 print:hover:bg-transparent"
                  >
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-500 print:border-slate-400 print:text-black">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 p-2 print:border-slate-400">
                      <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black block">
                        {order.awbNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 print:border-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white print:text-black block">
                        {order.receiverName} ({order.receiverPhone})
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 block">
                        {order.receiverAddress}, {order.receiverCity} - {order.receiverPincode}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono print:border-slate-400 print:text-black">
                      {order.packageWeight} kg
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono print:border-slate-400">
                      {order.paymentMode === "COD" ? (
                        <span className="font-bold text-amber-700 dark:text-amber-400 print:text-black">
                          COD ₹{order.totalAmount.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="font-medium text-emerald-700 dark:text-emerald-400 print:text-black">
                          PREPAID
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2 text-center align-bottom print:border-slate-400">
                      <div className="h-7 border-b border-dashed border-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cash & Delivery Reconciliation Block */}
          <div className="mt-8 border-t-2 border-slate-900 pt-4 print:mt-6">
            <div className="grid grid-cols-2 gap-6 text-xs sm:grid-cols-4 print:text-black">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500">Total Consignments</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white print:text-black">
                  {orderCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500">Total Weight</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white print:text-black">
                  {totalWeight.toFixed(2)} kg
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500">Total COD to Collect</span>
                <span className="font-mono text-base font-bold text-amber-600 print:text-black">
                  ₹{totalCod.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500">Actual Cash Deposited</span>
                <span className="font-mono text-base font-bold text-slate-400 print:text-black">
                  ₹ ____________
                </span>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="mt-10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 print:text-black">
              <div className="w-48 text-center">
                <div className="mb-1 border-b border-slate-400 pb-8" />
                <span className="font-bold">Driver Signature</span>
                <p className="text-[10px] text-slate-500">{trip.driverName}</p>
              </div>

              <div className="w-48 text-center">
                <div className="mb-1 border-b border-slate-400 pb-8" />
                <span className="font-bold">Dispatch Supervisor</span>
                <p className="text-[10px] text-slate-500">Hub Operations</p>
              </div>

              <div className="w-48 text-center">
                <div className="mb-1 border-b border-slate-400 pb-8" />
                <span className="font-bold">Security Seal & Date</span>
                <p className="text-[10px] text-slate-500">Gate Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
