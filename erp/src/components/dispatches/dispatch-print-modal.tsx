"use client";

import { Modal } from "@/components/ui/modal";
import { IconPrinter } from "@/components/icons/nav-icons";
import { printIsolatedElement } from "@/lib/print-utils";
import { SvgBarcode } from "@/components/orders/svg-barcode";
import type { DispatchDetail, DispatchOrderDetail } from "./dispatch-detail-modal";

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
  orders: DispatchOrderDetail[];
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
  dispatch?: DispatchDetail | DispatchPrintTrip | null;
  open?: boolean;
  onClose: () => void;
}) {
  const tripData: DispatchPrintTrip | null =
    initialTrip ||
    (dispatch
      ? {
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
          orders: (dispatch.orders || []) as DispatchOrderDetail[],
          orderCount: dispatch.orders?.length ?? 0,
          totalWeight: dispatch.orders
            ? dispatch.orders.reduce((sum, o) => sum + (Number(o.packageWeight) || 0), 0)
            : 0,
          totalCod: dispatch.orders
            ? dispatch.orders
                .filter((o) => o.paymentMode === "COD")
                .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
            : 0,
        }
      : null);

  if (!open || !tripData) return null;

  function handlePrint() {
    printIsolatedElement("dispatch-runsheet-letterhead", "a4");
  }

  const formattedDate = new Date(tripData.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalWeight =
    tripData.totalWeight ??
    tripData.orders.reduce((sum, o) => sum + (Number(o.packageWeight) || 0), 0);
  const totalCod =
    tripData.totalCod ??
    tripData.orders
      .filter((o) => o.paymentMode === "COD")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const orderCount = tripData.orderCount ?? tripData.orders.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Official Driver Delivery Run-Sheet (Letterhead Preview)"
      description="Official operational letterhead document for outbound staging, driver custody, and cash reconciliation."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Printable Letterhead Document Container */}
        <div className="flex justify-center bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-[var(--border)] overflow-x-auto custom-scrollbar">
          <div
            id="dispatch-runsheet-letterhead"
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
                  RUN-SHEET MANIFEST
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
                  REF: {tripData.tripNumber}
                </div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>
                  Date: {formattedDate}
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
                  OFFICIAL DISPATCH TRIP RUN-SHEET & LAST-MILE CUSTODY MANIFEST
                </span>
                <p style={{ fontSize: "9.5px", color: "#475569", margin: "1px 0 0" }}>
                  Authorized for Hub Outbound Staging, Courier Custody Handover, and Doorstep e-POD Settlement
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
                  {tripData.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Trip Fleet & Routing Bar with Barcode */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1.5fr 1.2fr 1.2fr",
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
                  VEHICLE & FLEET REG
                </span>
                <p style={{ fontFamily: "monospace", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                  {tripData.vehicleNumber}
                </p>
                <span style={{ fontSize: "9px", color: "#475569" }}>
                  Type: {tripData.type === "LAST_MILE" ? "Last-Mile Delivery" : "Linehaul Transfer"}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  ASSIGNED DRIVER / COURIER
                </span>
                <p style={{ fontWeight: "900", color: "#000000", margin: "1px 0 0" }}>
                  {tripData.driverName}
                </p>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#1e293b" }}>
                  {tripData.driverPhone}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  DEPOT & DELIVERY ROUTE
                </span>
                <p style={{ fontWeight: "800", color: "#000000", margin: "2px 0 0", lineHeight: "1.2" }}>
                  {tripData.originHub} → {tripData.destinationHub || "Local Delivery Sector"}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                  MANIFEST BARCODE
                </span>
                <div style={{ marginTop: "2px" }}>
                  <SvgBarcode value={tripData.tripNumber} height={20} className="w-28 ml-auto" />
                </div>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#000000", fontWeight: "800" }}>
                  {tripData.tripNumber}
                </span>
              </div>
            </div>

            {/* Consignment Delivery Checklist Table */}
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <h3
                  style={{
                    fontSize: "10px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: 0,
                    color: "#000000",
                  }}
                >
                  CONSIGNMENT DELIVERY CHECKLIST ({tripData.orders.length} PARCELS)
                </h3>
                <span style={{ fontSize: "9px", color: "#64748b" }}>
                  Check package integrity upon customer handover
                </span>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #000000",
                  fontSize: "10px",
                  lineHeight: "1.25",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderBottom: "1.5px solid #000000",
                      textTransform: "uppercase",
                      fontSize: "9px",
                      fontWeight: "800",
                      color: "#1e293b",
                    }}
                  >
                    <th style={{ border: "1px solid #cbd5e1", padding: "5px 4px", width: "24px", textAlign: "center" }}>
                      #
                    </th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", width: "115px" }}>
                      AWB & Barcode
                    </th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px" }}>
                      Consignee Details & Address
                    </th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", width: "65px", textAlign: "center" }}>
                      Weight
                    </th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", width: "95px", textAlign: "right" }}>
                      Payment Mode
                    </th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "5px 6px", width: "125px", textAlign: "center" }}>
                      Recipient Sign / e-POD Proof
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tripData.orders.map((order, idx) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: idx % 2 === 1 ? "#fafafa" : "#ffffff",
                      }}
                    >
                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "6px 4px",
                          textAlign: "center",
                          fontFamily: "monospace",
                          fontWeight: "800",
                          color: "#334155",
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 6px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: "900", color: "#000000", display: "block" }}>
                          {order.awbNumber}
                        </span>
                        <div style={{ marginTop: "2px" }}>
                          <SvgBarcode value={order.awbNumber} height={14} className="w-24" />
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: "8.5px", color: "#64748b" }}>
                          {order.orderNumber}
                        </span>
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 6px" }}>
                        <span style={{ fontWeight: "800", color: "#000000", display: "block" }}>
                          {order.receiverName}{" "}
                          <span style={{ fontWeight: "normal", color: "#475569" }}>
                            ({order.receiverPhone})
                          </span>
                        </span>
                        <span style={{ fontSize: "9px", color: "#334155", display: "block", marginTop: "1px" }}>
                          {order.receiverAddress}, {order.receiverCity} - {order.receiverPincode}
                        </span>
                      </td>
                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "6px 6px",
                          textAlign: "center",
                          fontFamily: "monospace",
                          fontWeight: "800",
                          color: "#000000",
                        }}
                      >
                        {Number(order.packageWeight).toFixed(2)} kg
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "6px 6px", textAlign: "right" }}>
                        {order.paymentMode === "COD" ? (
                          <div style={{ textAlign: "right" }}>
                            <span
                              style={{
                                display: "inline-block",
                                border: "1px solid #000000",
                                padding: "1px 5px",
                                backgroundColor: "#ffffff",
                                fontWeight: "900",
                                fontSize: "9.5px",
                                color: "#000000",
                              }}
                            >
                              COD: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontWeight: "800",
                              color: "#047857",
                              fontSize: "9px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            PREPAID
                          </span>
                        )}
                      </td>
                      <td style={{ border: "1px solid #cbd5e1", padding: "4px 6px", verticalAlign: "bottom" }}>
                        <div style={{ fontSize: "8px", color: "#94a3b8", marginBottom: "12px", textAlign: "left" }}>
                          Time: _________ Recv By: _________
                        </div>
                        <div style={{ borderBottom: "1px dashed #64748b" }} />
                        <span style={{ fontSize: "7.5px", color: "#64748b", display: "block", textAlign: "center", marginTop: "1px" }}>
                          Customer Signature
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cash & Consignment Reconciliation Summary */}
            <div
              style={{
                marginTop: "14px",
                border: "1.5px solid #000000",
                backgroundColor: "#f8fafc",
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1.2fr 1.4fr",
                  gap: "8px",
                  fontSize: "10px",
                }}
              >
                <div>
                  <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#64748b" }}>
                    TOTAL CONSIGNMENTS
                  </span>
                  <p style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                    {orderCount} <span style={{ fontSize: "10px", fontWeight: "normal" }}>Parcels</span>
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#64748b" }}>
                    TOTAL GROSS WEIGHT
                  </span>
                  <p style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                    {totalWeight.toFixed(2)} <span style={{ fontSize: "10px", fontWeight: "normal" }}>kg</span>
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#64748b" }}>
                    TOTAL COD TO COLLECT
                  </span>
                  <p style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                    ₹{totalCod.toLocaleString("en-IN")}
                  </p>
                </div>

                <div style={{ borderLeft: "1px solid #cbd5e1", paddingLeft: "8px" }}>
                  <span style={{ fontSize: "8.5px", fontWeight: "800", textTransform: "uppercase", color: "#64748b" }}>
                    ACTUAL CASH DEPOSITED
                  </span>
                  <p style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "900", color: "#000000", margin: "2px 0 0" }}>
                    ₹ ___________________
                  </p>
                  <span style={{ fontSize: "8px", color: "#64748b" }}>
                    NDR / Returned Parcels: _______
                  </span>
                </div>
              </div>
            </div>

            {/* Tripartite Audit & Custody Handover Sign-Off */}
            <div
              style={{
                marginTop: "16px",
                marginBottom: "8px",
                borderTop: "1.5px solid #000000",
                paddingTop: "12px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                }}
              >
                <div style={{ borderTop: "1px dashed #64748b", paddingTop: "4px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    Delivery Courier / Driver
                  </p>
                  <p style={{ fontSize: "8.5px", color: "#475569", margin: "2px 0 0" }}>
                    {tripData.driverName} ({tripData.vehicleNumber})
                  </p>
                  <span style={{ fontSize: "8px", color: "#64748b", display: "block", marginTop: "1px" }}>
                    Sign & Shift Handover Ack
                  </span>
                </div>

                <div style={{ borderTop: "1px dashed #64748b", paddingTop: "4px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    Dispatch Operations Supervisor
                  </p>
                  <p style={{ fontSize: "8.5px", color: "#475569", margin: "2px 0 0" }}>
                    {tripData.originHub}
                  </p>
                  <span style={{ fontSize: "8px", color: "#64748b", display: "block", marginTop: "1px" }}>
                    Staging Verification & Seal Stamp
                  </span>
                </div>

                <div style={{ borderTop: "1px dashed #64748b", paddingTop: "4px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "#000000", margin: 0 }}>
                    Finance & Cashier Gate Inbound
                  </p>
                  <p style={{ fontSize: "8.5px", color: "#475569", margin: "2px 0 0" }}>
                    Cash Remittance & Voucher Reconciled
                  </p>
                  <span style={{ fontSize: "8px", color: "#64748b", display: "block", marginTop: "1px" }}>
                    Signature & Cashier Stamp
                  </span>
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
                This official run-sheet is generated automatically by Agentic Logistics ERP. All delivered packages require signed e-POD proof or physical signature.
              </p>
              <p style={{ fontFamily: "monospace", margin: 0 }}>
                PAGE 1 OF 1 · AUDIT COMPLIANT · DIGITAL E-POD SYNCED
              </p>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="no-print flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--muted)]">
            Formatted for standard A4 portrait letterhead printing with high-fidelity isolation.
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
              Print Run-Sheet (Letterhead)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
