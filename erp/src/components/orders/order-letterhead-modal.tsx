"use client";

import { Modal } from "@/components/ui/modal";
import { IconPrinter } from "@/components/icons/nav-icons";
import { printIsolatedElement } from "@/lib/print-utils";
import { SvgBarcode } from "@/components/orders/svg-barcode";
import type { OrderDetail } from "@/components/orders/order-detail-modal";

interface OrderLetterheadModalProps {
  open: boolean;
  order: OrderDetail | null;
  onClose: () => void;
}

export function OrderLetterheadModal({
  open,
  order,
  onClose,
}: OrderLetterheadModalProps) {
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
        <div className="flex justify-center bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-[var(--border)] overflow-x-auto custom-scrollbar">
          <div
            id="internal-manifest-letterhead"
            className="w-full max-w-[760px] bg-white text-black p-8 font-sans text-xs shadow-lg rounded-sm border border-slate-300 select-none"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              boxSizing: "border-box",
            }}
          >
            {/* Header: Official Company Letterhead */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                borderBottom: "2px solid #000000",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Logo Image */}
                <img
                  src="/logo-128.png"
                  alt="Agentic Logistics"
                  style={{
                    height: "48px",
                    width: "48px",
                    objectFit: "contain",
                    borderRadius: "6px",
                  }}
                />
                <div>
                  <h1
                    style={{
                      fontSize: "15px",
                      fontWeight: "900",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      lineHeight: "1.1",
                      margin: 0,
                      color: "#000000",
                    }}
                  >
                    AGENTIC LOGISTICS INDIA PRIVATE LIMITED
                  </h1>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#334155",
                      marginTop: "2px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Autonomous Freight Management & Supply Chain Infrastructure
                  </p>
                  <p style={{ fontSize: "10px", color: "#1e293b", marginTop: "4px", lineHeight: "1.3" }}>
                    <strong>Registered Operations Office:</strong> Ayantika Apartment, 76/B Selimpur Lane, Kolkata - 700031, West Bengal, India
                  </p>
                  <p style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
                    CIN: U63090WB2026PTC288910 · GSTIN: 19AAACA9876Q1Z2 · Helpline: +91 33 2415 8890
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span
                  style={{
                    display: "inline-block",
                    border: "2px solid #000000",
                    color: "#000000",
                    backgroundColor: "#ffffff",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    fontWeight: "900",
                    padding: "2px 8px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  INTERNAL NOTE
                </span>
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    fontWeight: "800",
                    color: "#000000",
                  }}
                >
                  REF: {manifestRef}
                </div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>
                  Date: {bookingDate}
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div
              style={{
                marginTop: "12px",
                marginBottom: "12px",
                borderLeft: "4px solid #000000",
                borderTop: "1px solid #cbd5e1",
                borderRight: "1px solid #cbd5e1",
                borderBottom: "1px solid #cbd5e1",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: "900",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#000000",
                  }}
                >
                  CONSIGNMENT DISPATCH NOTE & INTERNAL CUSTODY MANIFEST
                </span>
                <p style={{ fontSize: "9.5px", color: "#475569", margin: "1px 0 0" }}>
                  Authorized for Hub Staging, Primary Linehaul Transfer & Last-Mile Delivery Runs
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "9.5px", fontWeight: "700", textTransform: "uppercase", color: "#334155" }}>
                  Lifecycle Status:{" "}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    color: "#000000",
                    border: "1.5px solid #000000",
                    padding: "1px 6px",
                    backgroundColor: "#ffffff",
                    textTransform: "uppercase",
                  }}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Consignment Identification Bar with Barcode */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr",
                gap: "8px",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "8px 10px",
                marginBottom: "12px",
                fontSize: "11px",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  ORDER NUMBER
                </span>
                <p style={{ fontFamily: "monospace", fontWeight: "800", color: "#000000", margin: "2px 0 0" }}>
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  AWB NUMBER & BARCODE
                </span>
                <p style={{ fontFamily: "monospace", fontWeight: "900", color: "#000000", margin: "1px 0 2px" }}>
                  {order.awbNumber}
                </p>
                <SvgBarcode value={order.awbNumber} height={24} />
              </div>
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  SERVICE CATEGORY
                </span>
                <p style={{ fontWeight: "800", color: "#000000", margin: "2px 0 0" }}>
                  {order.serviceType.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  PAYMENT MODE
                </span>
                <p style={{ fontWeight: "800", color: "#000000", margin: "2px 0 0" }}>
                  {order.paymentMode}
                </p>
              </div>
            </div>

            {/* Bilateral Routing: Shipper Origin & Consignee Destination */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              {/* Origin Facility */}
              <div
                style={{
                  border: "1px solid #000000",
                  padding: "10px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #000000",
                    paddingBottom: "4px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "#334155",
                    }}
                  >
                    ORIGIN / SHIPPER FACILITY
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#000000" }}>
                    {order.senderCity}
                  </span>
                </div>
                <div style={{ fontSize: "10.5px", lineHeight: "1.35", color: "#1e293b" }}>
                  <p style={{ fontWeight: "900", color: "#000000", margin: "0 0 2px" }}>
                    {order.senderName}
                  </p>
                  <p style={{ fontSize: "9.5px", margin: "0 0 2px" }}>Contact: {order.senderPhone}</p>
                  <p style={{ margin: "0 0 2px" }}>{order.senderAddress}</p>
                  <p style={{ fontWeight: "800", color: "#000000", margin: 0 }}>
                    {order.senderCity}, {order.senderState} - {order.senderPincode}
                  </p>
                </div>
              </div>

              {/* Destination Facility */}
              <div
                style={{
                  border: "1px solid #000000",
                  padding: "10px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #000000",
                    paddingBottom: "4px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "#334155",
                    }}
                  >
                    DESTINATION / CONSIGNEE POINT
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#000000" }}>
                    {order.receiverCity}
                  </span>
                </div>
                <div style={{ fontSize: "10.5px", lineHeight: "1.35", color: "#1e293b" }}>
                  <p style={{ fontWeight: "900", color: "#000000", margin: "0 0 2px" }}>
                    {order.receiverName}
                  </p>
                  <p style={{ fontSize: "9.5px", margin: "0 0 2px" }}>Contact: {order.receiverPhone}</p>
                  <p style={{ margin: "0 0 2px" }}>{order.receiverAddress}</p>
                  <p style={{ fontWeight: "800", color: "#000000", margin: 0 }}>
                    {order.receiverCity}, {order.receiverState} - {order.receiverPincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Telemetry & Volumetric Scale Audit Table */}
            <div
              style={{
                border: "1px solid #000000",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f1f5f9",
                  padding: "6px 10px",
                  borderBottom: "1px solid #000000",
                  fontWeight: "800",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#1e293b",
                }}
              >
                Package & Dimensional Telemetry Audit
              </div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #cbd5e1",
                      backgroundColor: "#f8fafc",
                      textAlign: "left",
                      fontSize: "9px",
                      textTransform: "uppercase",
                      fontWeight: "800",
                      color: "#475569",
                    }}
                  >
                    <th style={{ padding: "6px 10px" }}>Item Description</th>
                    <th style={{ padding: "6px 8px" }}>Dimensions (L×W×H)</th>
                    <th style={{ padding: "6px 8px", textAlign: "right" }}>Dead Wt</th>
                    <th style={{ padding: "6px 8px", textAlign: "right" }}>Volumetric Wt</th>
                    <th style={{ padding: "6px 10px", textAlign: "right" }}>Chargeable Wt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 10px", fontWeight: "700", color: "#000000" }}>
                      {order.itemDescription}
                    </td>
                    <td style={{ padding: "8px 8px", fontFamily: "monospace" }}>
                      {order.lengthCm} × {order.widthCm} × {order.heightCm} cm
                    </td>
                    <td style={{ padding: "8px 8px", textAlign: "right" }}>{order.packageWeight} kg</td>
                    <td style={{ padding: "8px 8px", textAlign: "right" }}>{order.volumetricWeight} kg</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "900", color: "#000000" }}>
                      {order.chargeableWeight} kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Commercials Ledger */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.2fr",
                gap: "8px",
                border: "1px solid #000000",
                padding: "8px 12px",
                marginBottom: "14px",
                fontSize: "11px",
                backgroundColor: "#ffffff",
              }}
            >
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  FREIGHT TARIFF
                </span>
                <p style={{ fontSize: "13px", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                  ₹{order.totalAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  DECLARED VALUE
                </span>
                <p style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", margin: "2px 0 0" }}>
                  ₹{order.declaredValue.toLocaleString()}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  CUSTODY COLLECTION
                </span>
                <p style={{ fontSize: "13px", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                  {order.paymentMode === "COD" ? `COD DUE: ₹${order.totalAmount}` : "PREPAID / NIL"}
                </p>
              </div>
            </div>

            {/* Operational Sign-off & Chain of Custody */}
            <div
              style={{
                border: "1px solid #000000",
                padding: "10px 12px",
                marginBottom: "12px",
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                OPERATIONAL HANDOVER & CHAIN OF CUSTODY VERIFICATION
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                  paddingTop: "6px",
                }}
              >
                <div style={{ borderTop: "1px dashed #64748b", paddingTop: "4px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    Origin Dispatch Officer
                  </p>
                  <p style={{ fontSize: "8.5px", color: "#64748b", margin: "2px 0 0" }}>
                    Seal Verified & Handed Over
                  </p>
                </div>
                <div style={{ borderTop: "1px dashed #64748b", paddingTop: "4px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    Linehaul Pilot / Driver
                  </p>
                  <p style={{ fontSize: "8.5px", color: "#64748b", margin: "2px 0 0" }}>
                    Vehicle Seal & Manifest Ack
                  </p>
                </div>
                <div style={{ borderTop: "1px dashed #64748b", paddingTop: "4px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    Last-Mile Hub Supervisor
                  </p>
                  <p style={{ fontSize: "8.5px", color: "#64748b", margin: "2px 0 0" }}>
                    Received for Courier Dispatch
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Audit Footer Disclaimer */}
            <div
              style={{
                borderTop: "1px solid #cbd5e1",
                paddingTop: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "#64748b",
              }}
            >
              <p style={{ margin: 0 }}>
                This internal manifest is generated automatically by Agentic Logistics ERP for inventory & transit governance.
              </p>
              <p style={{ fontFamily: "monospace", margin: 0 }}>PAGE 1 OF 1 · AUDIT COMPLIANT</p>
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
