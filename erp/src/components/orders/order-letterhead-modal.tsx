"use client";

import { Modal } from "@/components/ui/modal";
import { IconPrinter } from "@/components/icons/nav-icons";
import { printIsolatedElement } from "@/lib/print-utils";
import type { OrderDetail } from "@/components/orders/order-detail-modal";

interface OrderLetterheadModalProps {
  open: boolean;
  order: OrderDetail | null;
  onClose: () => void;
}

export function OrderLetterheadModal({ open, order, onClose }: OrderLetterheadModalProps) {
  if (!order) return null;

  function handlePrint() {
    printIsolatedElement("internal-manifest-letterhead", "a4");
  }

  const bookingDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const manifestRef = `MNF-${order.orderNumber.replace("ORD-", "")}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Internal Consignment Manifest (Letterhead Preview)"
      description="Official operational letterhead document for internal dispatch custody, hub transfer, and audit."
      wide
    >
      <div className="space-y-6">
        {/* Printable Letterhead Document Container */}
        <div className="flex justify-center bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-[var(--border)] overflow-x-auto">
          <div
            id="internal-manifest-letterhead"
            className="w-full max-w-[760px] bg-white text-black p-8 font-sans text-xs shadow-lg rounded-sm border border-slate-200 select-none"
          >
            {/* Header: Official Company Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-start gap-3">
                {/* Logo Image */}
                <img
                  src="/logo-128.png"
                  alt="Agentic Logistics"
                  className="h-12 w-12 object-contain rounded-lg"
                />
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-950 uppercase leading-none">
                    AGENTIC LOGISTICS INDIA PRIVATE LIMITED
                  </h1>
                  <p className="text-[10px] font-bold text-slate-600 mt-0.5 tracking-wider uppercase">
                    Autonomous Freight Management & Supply Chain Infrastructure
                  </p>
                  <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                    <strong>Registered Operations Office:</strong> Ayantika Apartment, 76/B Selimpur Lane, Kolkata - 700031, West Bengal, India
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    CIN: U63090WB2026PTC288910 · GSTIN: 19AAACA9876Q1Z2 · Helpline: +91 33 2415 8890
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-black px-2.5 py-1 tracking-wider uppercase rounded-xs">
                  INTERNAL NOTE
                </span>
                <div className="mt-1 text-[11px] font-mono font-bold text-slate-900">
                  REF: {manifestRef}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Date: {bookingDate}
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="mt-3.5 mb-3 bg-slate-100 border-l-4 border-slate-900 px-3 py-1.5 flex items-center justify-between">
              <div>
                <span className="font-black text-xs uppercase tracking-wider text-slate-900">
                  CONSIGNMENT DISPATCH NOTE & INTERNAL CUSTODY MANIFEST
                </span>
                <p className="text-[10px] text-slate-600">
                  Authorized for Hub Staging, Primary Linehaul Transfer & Last-Mile Delivery Runs
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-700">Lifecycle Status: </span>
                <span className="text-[11px] font-black text-slate-950 border border-slate-400 px-2 py-0.5 bg-white uppercase">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Consignment Identification Bar */}
            <div className="grid grid-cols-4 gap-2 border border-slate-300 bg-white p-2.5 mb-3 text-[11px]">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">ORDER NUMBER</span>
                <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">AWB NUMBER</span>
                <p className="font-mono font-bold text-slate-900">{order.awbNumber}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">SERVICE CATEGORY</span>
                <p className="font-bold text-slate-900">{order.serviceType.replace(/_/g, " ")}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">PAYMENT MODE</span>
                <p className="font-bold text-slate-900">{order.paymentMode}</p>
              </div>
            </div>

            {/* Bilateral Routing: Shipper Origin & Consignee Destination */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Origin Facility */}
              <div className="border border-slate-300 p-3 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                    ORIGIN / SHIPPER FACILITY
                  </span>
                  <span className="text-[10px] font-bold text-slate-900">{order.senderCity}</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-slate-800">
                  <p className="font-black text-black">{order.senderName}</p>
                  <p className="text-[10px]">Contact: {order.senderPhone}</p>
                  <p className="leading-snug">{order.senderAddress}</p>
                  <p className="font-bold text-slate-950">
                    {order.senderCity}, {order.senderState} - {order.senderPincode}
                  </p>
                </div>
              </div>

              {/* Destination Facility */}
              <div className="border border-slate-300 p-3 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                    DESTINATION / CONSIGNEE POINT
                  </span>
                  <span className="text-[10px] font-bold text-slate-900">{order.receiverCity}</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-slate-800">
                  <p className="font-black text-black">{order.receiverName}</p>
                  <p className="text-[10px]">Contact: {order.receiverPhone}</p>
                  <p className="leading-snug">{order.receiverAddress}</p>
                  <p className="font-bold text-slate-950">
                    {order.receiverCity}, {order.receiverState} - {order.receiverPincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Telemetry & Volumetric Scale Audit Table */}
            <div className="border border-slate-300 mb-3">
              <div className="bg-slate-100 px-3 py-1 border-b border-slate-300 font-bold text-[10px] uppercase tracking-wider text-slate-700">
                Package & Dimensional Telemetry Audit
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-[9px] uppercase font-bold text-slate-600">
                    <th className="py-1.5 px-3">Item Description</th>
                    <th className="py-1.5 px-2">Dimensions (L×W×H)</th>
                    <th className="py-1.5 px-2 text-right">Dead Wt</th>
                    <th className="py-1.5 px-2 text-right">Volumetric Wt</th>
                    <th className="py-1.5 px-3 text-right">Chargeable Wt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">{order.itemDescription}</td>
                    <td className="py-2 px-2 font-mono">{order.lengthCm} × {order.widthCm} × {order.heightCm} cm</td>
                    <td className="py-2 px-2 text-right">{order.packageWeight} kg</td>
                    <td className="py-2 px-2 text-right">{order.volumetricWeight} kg</td>
                    <td className="py-2 px-3 text-right font-black text-black">{order.chargeableWeight} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Commercials Ledger */}
            <div className="grid grid-cols-3 gap-2 border border-slate-300 p-2.5 mb-4 text-[11px] bg-slate-50/30">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">FREIGHT TARIFF</span>
                <p className="text-sm font-black text-slate-950">₹{order.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">DECLARED VALUE</span>
                <p className="text-sm font-bold text-slate-800">₹{order.declaredValue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">CUSTODY COLLECTION</span>
                <p className="text-sm font-black text-slate-950">
                  {order.paymentMode === "COD" ? `COD DUE: ₹${order.totalAmount}` : "PREPAID / NIL"}
                </p>
              </div>
            </div>

            {/* Operational Sign-off & Chain of Custody */}
            <div className="border border-slate-300 p-3 mb-3 bg-white">
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-600 mb-2">
                OPERATIONAL HANDOVER & CHAIN OF CUSTODY VERIFICATION
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="text-[10px] font-bold text-slate-900">Origin Dispatch Officer</p>
                  <p className="text-[9px] text-slate-500">Seal Verified & Handed Over</p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="text-[10px] font-bold text-slate-900">Linehaul Pilot / Driver</p>
                  <p className="text-[9px] text-slate-500">Vehicle Seal & Manifest Ack</p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="text-[10px] font-bold text-slate-900">Last-Mile Hub Supervisor</p>
                  <p className="text-[9px] text-slate-500">Received for Courier Dispatch</p>
                </div>
              </div>
            </div>

            {/* Internal Audit Footer Disclaimer */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-500">
              <p>
                This internal manifest is generated automatically by Agentic Logistics ERP for inventory & transit governance.
              </p>
              <p className="font-mono">
                PAGE 1 OF 1 · AUDIT COMPLIANT
              </p>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="no-print flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--muted)]">
            Formatted for standard A4 portrait letterhead printing.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary text-xs"
            >
              <IconPrinter className="h-4 w-4" />
              Print Internal Manifest (Letterhead)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
