"use client";

import { Modal } from "@/components/ui/modal";
import { IconPrinter } from "@/components/icons/nav-icons";
import { printIsolatedElement } from "@/lib/print-utils";
import type { OrderItem } from "@/app/orders/orders-client";

interface OrderPrintModalProps {
  open: boolean;
  order: OrderItem | null;
  onClose: () => void;
}

export function OrderPrintModal({ open, order, onClose }: OrderPrintModalProps) {
  if (!order) return null;

  function handlePrint() {
    printIsolatedElement("thermal-shipping-label", "thermal");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Shipping Label Preview"
      description={`AWB Manifest: ${order.awbNumber} · Standard 4x6 Thermal Label`}
      wide
    >
      <div className="space-y-6">
        {/* Printable 4x6 Thermal AWB Label Container */}
        <div className="flex justify-center bg-[var(--surface-raised)]/50 p-4 rounded-2xl border border-[var(--border)] overflow-x-auto">
          <div
            id="thermal-shipping-label"
            className="w-full max-w-[390px] border-2 border-black bg-white text-black p-5 font-mono text-xs shadow-md select-none"
          >
            {/* Header: Carrier Logo & Mode */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <div>
                <div className="text-base font-black tracking-widest leading-none">AGENTIC LOGISTICS</div>
                <div className="text-[10px] font-bold text-slate-700 tracking-wider mt-0.5">EXPRESS FREIGHT SYSTEM</div>
              </div>
              <div className="text-right">
                <span className="inline-block border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                  {order.serviceType}
                </span>
                <div className="text-[10px] font-bold mt-0.5">{order.paymentMode}</div>
              </div>
            </div>

            {/* High-Contrast AWB Barcode Simulation */}
            <div className="py-3 text-center border-b-2 border-black">
              <div className="flex justify-center items-end gap-[2px] h-14 mx-auto px-2">
                {[
                  3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 1, 4, 3, 1, 2, 4, 1,
                  3, 2, 1, 4, 1, 3, 2, 4, 1, 2, 4, 3, 1, 2, 1, 4, 2, 3, 1, 4, 2, 1, 3, 2
                ].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black"
                    style={{
                      width: `${w * 1.5}px`,
                      height: `${40 + (idx % 3) * 6}px`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1.5 text-xs font-black tracking-widest">{order.awbNumber}</div>
            </div>

            {/* Origin & Destination Addresses */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black py-3 text-[11px] leading-tight">
              {/* Deliver To */}
              <div className="pr-2 border-r border-black">
                <div className="font-black text-[9px] uppercase tracking-wider text-slate-600 mb-1">
                  DELIVER TO (CONSIGNEE):
                </div>
                <div className="font-black text-xs text-black">{order.receiverName}</div>
                <div className="mt-1">{order.receiverAddress}</div>
                <div className="font-black mt-1">
                  {order.receiverCity}, {order.receiverState}
                </div>
                <div className="font-black text-sm text-black mt-0.5 tracking-wider">
                  PIN: {order.receiverPincode}
                </div>
                <div className="mt-1 text-[10px]">TEL: {order.receiverPhone}</div>
              </div>

              {/* Return If Undelivered */}
              <div className="pl-1">
                <div className="font-black text-[9px] uppercase tracking-wider text-slate-600 mb-1">
                  RETURN IF UNDELIVERED:
                </div>
                <div className="font-bold text-black">{order.senderName}</div>
                <div className="mt-1">{order.senderAddress}</div>
                <div className="mt-1">
                  {order.senderCity}, {order.senderState} - {order.senderPincode}
                </div>
                <div className="mt-1 text-[10px]">TEL: {order.senderPhone}</div>
              </div>
            </div>

            {/* Package Contents & Dimensions */}
            <div className="border-b-2 border-black py-2 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>ITEM: <strong>{order.itemDescription}</strong></span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>DIMS: {order.lengthCm}x{order.widthCm}x{order.heightCm} cm</span>
                <span>ACTUAL WT: {order.packageWeight} kg</span>
              </div>
            </div>

            {/* Commercial Routing Footer */}
            <div className="pt-2.5 flex items-center justify-between text-xs font-black">
              <div>
                <div className="text-[9px] text-slate-600 font-bold uppercase">CHARGEABLE WT</div>
                <div className="text-sm font-black">{order.chargeableWeight} KG</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-slate-600 font-bold uppercase">ORDER REF</div>
                <div className="text-xs font-black">{order.orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-slate-600 font-bold uppercase">COLLECT / TARIFF</div>
                <div className="text-sm font-black">
                  {order.paymentMode === "COD" ? `COD: ₹${order.totalAmount}` : `PAID: ₹${order.totalAmount}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="no-print flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--muted)]">
            Prints isolated on standard 4" x 6" thermal label printers without modal frames.
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
              Print Shipping Label
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
