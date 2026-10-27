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

export function OrderBulkUploadModal({ open, onClose, onImported }: OrderBulkUploadModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  function downloadSampleCsv() {
    const headers = [
      "senderName",
      "senderPhone",
      "senderAddress",
      "senderCity",
      "senderState",
      "senderPincode",
      "receiverName",
      "receiverPhone",
      "receiverAddress",
      "receiverCity",
      "receiverState",
      "receiverPincode",
      "itemDescription",
      "packageWeight",
      "lengthCm",
      "widthCm",
      "heightCm",
      "paymentMode",
      "serviceType",
      "totalAmount",
      "declaredValue",
    ];

    const sampleRow1 = [
      "Plexi Warehouse Tech",
      "+919830112233",
      "76/B Selimpur Lane",
      "Kolkata",
      "West Bengal",
      "700031",
      "Apex Robotics Labs",
      "+919876543210",
      "Plot 44 Electronic City",
      "Bengaluru",
      "Karnataka",
      "560100",
      "Precision Avionics Sensors",
      "2.5",
      "25",
      "20",
      "15",
      "PREPAID",
      "EXPRESS",
      "1850",
      "25000",
    ];

    const sampleRow2 = [
      "Kolkata Textile Mills",
      "+919830998877",
      "12 Park Street",
      "Kolkata",
      "West Bengal",
      "700016",
      "Metro Retail Hub",
      "+919123456780",
      "88 Marine Drive",
      "Mumbai",
      "Maharashtra",
      "400020",
      "Export Cotton Garments",
      "8.0",
      "50",
      "40",
      "30",
      "COD",
      "STANDARD",
      "3200",
      "45000",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agentic_bulk_orders_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsingError(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) throw new Error("File is empty");

        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          throw new Error("CSV must include a header row and at least 1 consignment data row");
        }

        const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
        const rows: ParsedRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Parse CSV line handling potential quotes
          const rawCols = lines[i].split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
          if (rawCols.length < 13) continue;

          const rowObj: any = {};
          headers.forEach((h, colIdx) => {
            rowObj[h] = rawCols[colIdx] ?? "";
          });

          const pMode = rowObj.paymentMode?.toUpperCase() === "COD" ? PaymentMode.COD : PaymentMode.PREPAID;
          let sType: ServiceType = ServiceType.STANDARD;
          if (rowObj.serviceType?.toUpperCase() === "EXPRESS") sType = ServiceType.EXPRESS;
          if (rowObj.serviceType?.toUpperCase() === "COLD_CHAIN") sType = ServiceType.COLD_CHAIN;

          rows.push({
            senderName: rowObj.senderName || "Default Shipper",
            senderPhone: rowObj.senderPhone || "+919830000000",
            senderAddress: rowObj.senderAddress || "Central Logistics Hub",
            senderCity: rowObj.senderCity || "Kolkata",
            senderState: rowObj.senderState || "West Bengal",
            senderPincode: rowObj.senderPincode || "700001",
            receiverName: rowObj.receiverName || "Consignee",
            receiverPhone: rowObj.receiverPhone || "+919830000001",
            receiverAddress: rowObj.receiverAddress || "Consignee Address",
            receiverCity: rowObj.receiverCity || "Destination City",
            receiverState: rowObj.receiverState || "Destination State",
            receiverPincode: rowObj.receiverPincode || "110001",
            itemDescription: rowObj.itemDescription || "General Cargo",
            packageWeight: Math.max(0.1, Number(rowObj.packageWeight) || 1.0),
            lengthCm: Math.max(1, Number(rowObj.lengthCm) || 15),
            widthCm: Math.max(1, Number(rowObj.widthCm) || 10),
            heightCm: Math.max(1, Number(rowObj.heightCm) || 10),
            paymentMode: pMode,
            serviceType: sType,
            totalAmount: Math.max(0, Number(rowObj.totalAmount) || 0),
            declaredValue: Math.max(0, Number(rowObj.declaredValue) || 0),
          });
        }

        if (rows.length === 0) {
          throw new Error("No valid data rows found in CSV. Please verify column formatting.");
        }

        setParsedRows(rows);
      } catch (err) {
        setParsingError(err instanceof Error ? err.message : "Failed to parse CSV file");
        setParsedRows([]);
      }
    };

    reader.readAsText(file);
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
      title="Bulk Consignment Manifest Import"
      description="Upload a CSV spreadsheet to book up to 200 consignments at once."
      wide
    >
      <div className="space-y-5">
        {/* Helper & Template Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4">
          <div>
            <div className="text-xs font-bold text-[var(--text)]">Standard CSV Column Specifications</div>
            <p className="text-[11px] text-[var(--muted)]">
              Includes shipper origin, consignee address, telemetry (L×W×H, dead weight), and tariffs.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="btn btn-ghost text-xs"
          >
            Download Sample CSV Template &darr;
          </button>
        </div>

        {/* Upload Zone */}
        <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-6 text-center hover:border-[var(--primary)] transition-colors">
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] text-xl font-bold">
              &uarr;
            </div>
            <span className="text-xs font-bold text-[var(--text)]">
              {fileName ? fileName : "Click to select or drag & drop CSV file"}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Supported format: .csv · Max 200 rows per batch
            </span>
          </label>
        </div>

        {parsingError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            {parsingError}
          </div>
        )}

        {successCount !== null && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">
            Successfully imported {successCount} consignments! Refreshing manifest…
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && successCount === null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text)]">
                Parsed Preview ({parsedRows.length} Consignments Ready)
              </span>
              <span className="text-[11px] text-[var(--muted)]">Showing first 4 rows</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border)] max-h-48">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--muted)]">
                  <tr>
                    <th className="py-2 px-3">Shipper</th>
                    <th className="py-2 px-3">Receiver</th>
                    <th className="py-2 px-2">City</th>
                    <th className="py-2 px-2 text-right">Dead Wt</th>
                    <th className="py-2 px-2">Mode</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {parsedRows.slice(0, 4).map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 font-semibold">{row.senderName}</td>
                      <td className="py-1.5 px-3">{row.receiverName}</td>
                      <td className="py-1.5 px-2">{row.receiverCity}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{row.packageWeight} kg</td>
                      <td className="py-1.5 px-2 font-mono uppercase">{row.paymentMode}</td>
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
            {uploading ? "Importing Consignments…" : `Import ${parsedRows.length} Consignments`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
