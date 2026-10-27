"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { PaymentMode, ServiceType } from "@prisma/client";

interface OrderBulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface ParsedRow {
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
  paymentMode: PaymentMode;
  serviceType: ServiceType;
  totalAmount: number;
  declaredValue: number;
}

export function OrderBulkUploadModal({
  open,
  onClose,
  onImported,
}: OrderBulkUploadModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  async function downloadSampleExcel() {
    try {
      const res = await fetch("/api/orders/template");
      if (!res.ok) {
        throw new Error("Failed to generate Excel template");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "agentic_bulk_orders_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template download error:", err);
      alert("Unable to download template. Please try again.");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsingError(null);
    setSuccessCount(null);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/orders/parse-file", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to parse spreadsheet");
      }

      setParsedRows(json.rows || []);
    } catch (err) {
      setParsingError(err instanceof Error ? err.message : "Failed to parse file");
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setUploading(true);
    setParsingError(null);

    try {
      const res = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: parsedRows }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to bulk import orders");

      setSuccessCount(json.importedCount ?? parsedRows.length);
      setTimeout(() => {
        onImported();
        onClose();
      }, 1200);
    } catch (err) {
      setParsingError(err instanceof Error ? err.message : "Bulk upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !uploading && onClose()}
      title="Bulk Consignment Manifest Import (Excel & CSV)"
      description="Upload an official Excel spreadsheet (.xlsx) or CSV to batch book up to 200 consignments."
      wide
    >
      <div className="space-y-5">
        {/* Template Download Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/50 p-4">
          <div>
            <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
              <span>Standard Excel Booking Template (.xlsx)</span>
              <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                With In-Cell Dropdowns
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Features custom header banners, formatted weights/tariffs, and built-in dropdown menus for Payment Mode and Service Category.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadSampleExcel}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>Download Official Excel Template (.xlsx)</span>
            <span>&darr;</span>
          </button>
        </div>

        {/* Upload Zone */}
        <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-6 text-center hover:border-[var(--primary)] transition-colors">
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={handleFileChange}
            disabled={isParsing || uploading}
            className="hidden"
          />
          <label
            htmlFor="excel-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] text-xl font-bold">
              &uarr;
            </div>
            <span className="text-xs font-bold text-[var(--text)]">
              {isParsing
                ? "Parsing spreadsheet and validating columns…"
                : fileName
                ? fileName
                : "Click to select or drag & drop Excel (.xlsx) or CSV file"}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Supported formats: Microsoft Excel (.xlsx, .xls) & Standard CSV · Up to 200 consignments per batch
            </span>
          </label>
        </div>

        {parsingError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            {parsingError}
          </div>
        )}

        {successCount !== null && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">
            Successfully booked and staged {successCount} consignments! Refreshing manifest…
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && successCount === null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text)]">
                Parsed Preview ({parsedRows.length} Consignments Validated)
              </span>
              <span className="text-[11px] text-[var(--muted)]">Showing first 4 rows</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-[var(--border)] max-h-48">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--muted)]">
                  <tr>
                    <th className="py-2 px-3">Shipper</th>
                    <th className="py-2 px-3">Receiver</th>
                    <th className="py-2 px-2">City</th>
                    <th className="py-2 px-2 text-right">Dead Wt</th>
                    <th className="py-2 px-2 text-center">Payment</th>
                    <th className="py-2 px-2 text-center">Service</th>
                    <th className="py-2 px-3 text-right">Tariff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {parsedRows.slice(0, 4).map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 font-semibold">{row.senderName}</td>
                      <td className="py-1.5 px-3">{row.receiverName}</td>
                      <td className="py-1.5 px-2">{row.receiverCity}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{row.packageWeight} kg</td>
                      <td className="py-1.5 px-2 text-center">
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {row.paymentMode}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {row.serviceType}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold">₹{row.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="btn btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={uploading || parsedRows.length === 0}
            className="btn btn-primary text-xs"
          >
            {uploading ? "Booking Consignments…" : `Import ${parsedRows.length} Consignments`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
