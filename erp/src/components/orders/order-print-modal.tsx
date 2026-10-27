"use client";

import { Modal } from "@/components/ui/modal";
import { IconPrinter } from "@/components/icons/nav-icons";
import { printIsolatedElement } from "@/lib/print-utils";
import { SvgBarcode } from "@/components/orders/svg-barcode";
import type { OrderItem } from "@/app/orders/orders-client";

interface OrderPrintModalProps {
  open: boolean;
  order: OrderItem | null;
  orders?: OrderItem[];
  onClose: () => void;
}

export function ThermalLabelContent({
  order,
  index,
}: {
  order: OrderItem;
  index?: number;
}) {
  return (
    <div
      id={index !== undefined ? `thermal-shipping-label-${index}` : "thermal-shipping-label"}
      className="thermal-shipping-label select-none"
      style={{
        width: "3.8in",
        maxWidth: "3.8in",
        height: "5.6in",
        maxHeight: "5.6in",
        boxSizing: "border-box",
        margin: "0 auto",
        padding: "8px 10px",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: 'Arial, Helvetica, "Liberation Sans", sans-serif',
        fontSize: "11px",
        lineHeight: "1.25",
        border: "2px solid #000000",
        overflow: "hidden",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
        breakAfter: "page",
        breakInside: "avoid",
      }}
    >
      {/* 1. Carrier Header & Service Mode */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #000000",
          paddingBottom: "5px",
          marginBottom: "5px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "900",
              letterSpacing: "1.5px",
              lineHeight: "1.1",
              color: "#000000",
            }}
          >
            AGENTIC LOGISTICS
          </div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              color: "#333333",
              marginTop: "2px",
            }}
          >
            EXPRESS FREIGHT SYSTEM
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-block",
              border: "1.5px solid #000000",
              padding: "1px 6px",
              fontSize: "11px",
              fontWeight: "900",
              textTransform: "uppercase",
              lineHeight: "1.2",
              backgroundColor: "#ffffff",
              color: "#000000",
            }}
          >
            {order.serviceType}
          </div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "800",
              marginTop: "2px",
              textTransform: "uppercase",
              color: "#000000",
            }}
          >
            {order.paymentMode}
          </div>
        </div>
      </div>

      {/* 2. Vector SVG Barcode & AWB Code */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "2px solid #000000",
          paddingBottom: "5px",
          marginBottom: "5px",
        }}
      >
        <SvgBarcode value={order.awbNumber || "AWB-0000"} height={40} />
        <div
          style={{
            fontSize: "12px",
            fontWeight: "900",
            letterSpacing: "2px",
            marginTop: "3px",
            fontFamily: "monospace",
            color: "#000000",
          }}
        >
          {order.awbNumber}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            fontWeight: "800",
            color: "#333333",
            padding: "0 2px",
            marginTop: "2px",
          }}
        >
          <span>HUB: {order.receiverCity?.slice(0, 3).toUpperCase() || "DEL"}</span>
          <span>DEST PIN: {order.receiverPincode}</span>
          <span>ROUTING: EXP-S1</span>
        </div>
      </div>

      {/* 3. Origin & Destination Addresses (Two Column) */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #000000",
          paddingBottom: "5px",
          marginBottom: "5px",
          gap: "8px",
          fontSize: "10px",
          lineHeight: "1.25",
        }}
      >
        {/* Consignee (Deliver To) */}
        <div
          style={{
            flex: 1,
            borderRight: "1.5px solid #000000",
            paddingRight: "6px",
          }}
        >
          <div
            style={{
              fontSize: "8.5px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#444444",
              marginBottom: "2px",
            }}
          >
            DELIVER TO (CONSIGNEE):
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#000000",
              lineHeight: "1.2",
            }}
          >
            {order.receiverName}
          </div>
          <div style={{ marginTop: "2px", color: "#111111" }}>
            {order.receiverAddress}
          </div>
          <div style={{ fontWeight: "700", marginTop: "2px" }}>
            {order.receiverCity}, {order.receiverState}
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#000000",
              marginTop: "2px",
              letterSpacing: "0.5px",
            }}
          >
            PIN: {order.receiverPincode}
          </div>
          <div
            style={{
              marginTop: "2px",
              fontSize: "9.5px",
              fontWeight: "700",
            }}
          >
            TEL: {order.receiverPhone}
          </div>
        </div>

        {/* Shipper (Return if Undelivered) */}
        <div style={{ flex: 1, paddingLeft: "2px" }}>
          <div
            style={{
              fontSize: "8.5px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#444444",
              marginBottom: "2px",
            }}
          >
            RETURN IF UNDELIVERED:
          </div>
          <div style={{ fontWeight: "800", color: "#000000" }}>
            {order.senderName}
          </div>
          <div style={{ marginTop: "2px", color: "#222222" }}>
            {order.senderAddress}
          </div>
          <div style={{ marginTop: "2px" }}>
            {order.senderCity}, {order.senderState} - {order.senderPincode}
          </div>
          <div style={{ marginTop: "2px", fontSize: "9.5px" }}>
            TEL: {order.senderPhone}
          </div>
        </div>
      </div>

      {/* 4. Package Dimensions & Weight */}
      <div
        style={{
          borderBottom: "2px solid #000000",
          paddingBottom: "4px",
          marginBottom: "5px",
          fontSize: "9.5px",
          lineHeight: "1.3",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            ITEM: <strong>{order.itemDescription}</strong>
          </span>
          <span>
            VAL: <strong>₹{order.declaredValue?.toLocaleString() || "0"}</strong>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2px",
            fontSize: "10px",
          }}
        >
          <span>
            DIMS: {order.lengthCm}x{order.widthCm}x{order.heightCm} cm
          </span>
          <span>ACTUAL WT: {order.packageWeight} kg</span>
        </div>
      </div>

      {/* 5. Commercial Routing Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          fontSize: "10px",
          fontWeight: "800",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "8px",
              fontWeight: "800",
              textTransform: "uppercase",
              color: "#444444",
            }}
          >
            CHARGEABLE WT
          </div>
          <div style={{ fontSize: "12px", fontWeight: "900", marginTop: "1px" }}>
            {order.chargeableWeight} KG
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "8px",
              fontWeight: "800",
              textTransform: "uppercase",
              color: "#444444",
            }}
          >
            ORDER REF
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "900",
              fontFamily: "monospace",
              marginTop: "1px",
            }}
          >
            {order.orderNumber}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "8px",
              fontWeight: "800",
              textTransform: "uppercase",
              color: "#444444",
            }}
          >
            COLLECT / TARIFF
          </div>
          <div style={{ fontSize: "12px", fontWeight: "900", marginTop: "1px" }}>
            {order.paymentMode === "COD"
              ? `COD: ₹${order.totalAmount}`
              : `PAID: ₹${order.totalAmount}`}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderPrintModal({
  open,
  order,
  orders,
  onClose,
}: OrderPrintModalProps) {
  const orderList: OrderItem[] =
    orders && orders.length > 0 ? orders : order ? [order] : [];
  const isBatch = orderList.length > 1;

  if (orderList.length === 0) return null;

  function handlePrint() {
    printIsolatedElement("thermal-shipping-labels-container", "thermal");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isBatch
          ? `Batch Shipping Labels (${orderList.length} Selected)`
          : "Shipping Label Preview"
      }
      description={
        isBatch
          ? `Bundle preview of ${orderList.length} thermal labels. Will print 1 label per sheet.`
          : `AWB Manifest: ${orderList[0].awbNumber} · Standard 4x6 Thermal Label`
      }
      wide
    >
      <div className="space-y-5">
        {/* Printable 4x6 Thermal AWB Label Container */}
        <div className="bg-[var(--surface-raised)]/50 p-4 rounded-2xl border border-[var(--border)] overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <div id="thermal-shipping-labels-container" className="w-full space-y-6">
            {orderList.map((ord, idx) => (
              <div key={ord.id} className="thermal-label-page space-y-1">
                {isBatch && (
                  <div className="no-print flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border)]/60 pb-1 mb-2">
                    <span>
                      Consignment {idx + 1} of {orderList.length}: {ord.orderNumber}
                    </span>
                    <span className="font-mono">{ord.awbNumber}</span>
                  </div>
                )}
                <ThermalLabelContent order={ord} index={idx} />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="no-print flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--muted)]">
            {isBatch
              ? `Prints ${orderList.length} labels across ${orderList.length} pages in 1 clean spool job.`
              : 'Prints isolated on standard 4" x 6" thermal label printers without modal frames.'}
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
              {isBatch
                ? `Print All ${orderList.length} Labels`
                : "Print Shipping Label"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
