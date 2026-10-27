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

/**
 * RFC 4180 compliant CSV parser handling quotes, commas, and newlines.
 */
function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  // Strip leading UTF-8 BOM if present
  const cleanText = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\r") {
        // skip carriage return
      } else if (char === "\n") {
        row.push(cell.trim());
        if (row.some((c) => c !== "")) {
          lines.push(row);
        }
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== "")) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Normalizes a header string (e.g. "Sender Name", "sender_name", "senderName")
 * into a standard token for reliable lookup.
 */
function normalizeHeaderKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function OrderBulkUploadModal({
  open,
  onClose,
  onImported,
}: OrderBulkUploadModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  function downloadSampleCsv() {
    const headers = [
      "Sender Name",
      "Sender Phone",
      "Sender Address",
      "Sender City",
      "Sender State",
      "Sender Pincode",
      "Receiver Name",
      "Receiver Phone",
      "Receiver Address",
      "Receiver City",
      "Receiver State",
      "Receiver Pincode",
      "Item Description",
      "Package Weight (KG)",
      "Length (CM)",
      "Width (CM)",
      "Height (CM)",
      "Payment Mode",
      "Service Category",
      "Tariff Amount (INR)",
      "Declared Value (INR)",
    ];

    const sampleRow1 = [
      '"Plexi Warehouse Tech"',
      '"+91 98301 12233"',
      '"Ayantika Apartment, 76/B Selimpur Lane"',
      '"Kolkata"',
      '"West Bengal"',
      '"700031"',
      '"Apex Robotics Labs"',
      '"+91 98765 43210"',
      '"Plot 44, Electronic City Phase 1"',
      '"Bengaluru"',
      '"Karnataka"',
      '"560100"',
      '"Precision Avionics Sensors"',
      "2.5",
      "25",
      "20",
      "15",
      '"PREPAID"',
      '"EXPRESS"',
      "1850",
      "25000",
    ];

    const sampleRow2 = [
      '"Kolkata Textile Mills"',
      '"+91 98309 98877"',
      '"12 Park Street, Camac Area"',
      '"Kolkata"',
      '"West Bengal"',
      '"700016"',
      '"Metro Retail Hub"',
      '"+91 91234 56780"',
      '"88 Marine Drive, Nariman Point"',
      '"Mumbai"',
      '"Maharashtra"',
      '"400020"',
      '"Export Cotton Garments"',
      "8.0",
      "50",
      "40",
      "30",
      '"COD"',
      '"STANDARD"',
      "3200",
      "45000",
    ];

    const csvLines = [
      headers.map((h) => `"${h}"`).join(","),
      sampleRow1.join(","),
      sampleRow2.join(","),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvLines], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agentic_bulk_orders_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        if (!text || !text.trim()) throw new Error("File is empty");

        const matrix = parseCsv(text);
        if (matrix.length < 2) {
          throw new Error(
            "CSV must include a header row and at least 1 consignment data row"
          );
        }

        const rawHeaders = matrix[0];
        const normalizedHeaders = rawHeaders.map(normalizeHeaderKey);

        // Helper to locate column index by aliases
        const findCol = (...aliases: string[]): number => {
          for (const alias of aliases) {
            const norm = normalizeHeaderKey(alias);
            const idx = normalizedHeaders.findIndex((h) => h === norm || h.includes(norm));
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const colIdx = {
          senderName: findCol("sendername", "sender"),
          senderPhone: findCol("senderphone", "sendercontact", "originphone"),
          senderAddress: findCol("senderaddress", "originaddress"),
          senderCity: findCol("sendercity", "origincity"),
          senderState: findCol("senderstate", "originstate"),
          senderPincode: findCol("senderpincode", "senderpin", "originpin"),

          receiverName: findCol("receivername", "consigneename", "receiver"),
          receiverPhone: findCol("receiverphone", "consigneephone", "destphone"),
          receiverAddress: findCol("receiveraddress", "consigneeaddress", "destaddress"),
          receiverCity: findCol("receivercity", "consigneecity", "destcity"),
          receiverState: findCol("receiverstate", "consigneestate", "deststate"),
          receiverPincode: findCol("receiverpincode", "receiverpin", "destpin", "pincode"),

          itemDescription: findCol("itemdescription", "item", "description", "contents"),
          packageWeight: findCol("packageweight", "packageweightkg", "deadweight", "weight", "wt"),
          lengthCm: findCol("length", "lengthcm"),
          widthCm: findCol("width", "widthcm"),
          heightCm: findCol("height", "heightcm"),

          paymentMode: findCol("paymentmode", "payment", "mode"),
          serviceType: findCol("servicecategory", "servicetype", "service"),
          totalAmount: findCol("tariffamount", "tariffamountinr", "tariff", "totalamount", "amount"),
          declaredValue: findCol("declaredvalue", "declaredvalueinr", "value"),
        };

        const rows: ParsedRow[] = [];

        for (let i = 1; i < matrix.length; i++) {
          const row = matrix[i];
          if (!row || row.length === 0 || row.every((c) => !c.trim())) continue;

          const getVal = (idx: number, fallback = ""): string => {
            return idx !== -1 && row[idx] !== undefined ? row[idx].trim() : fallback;
          };

          const pModeRaw = getVal(colIdx.paymentMode, "PREPAID").toUpperCase();
          const pMode = pModeRaw.includes("COD") ? PaymentMode.COD : PaymentMode.PREPAID;

          const sTypeRaw = getVal(colIdx.serviceType, "STANDARD").toUpperCase();
          let sType: ServiceType = ServiceType.STANDARD;
          if (sTypeRaw.includes("EXPRESS")) sType = ServiceType.EXPRESS;
          if (sTypeRaw.includes("COLD")) sType = ServiceType.COLD_CHAIN;

          const receiverName = getVal(colIdx.receiverName);
          if (!receiverName) continue; // skip invalid or empty rows

          rows.push({
            senderName: getVal(colIdx.senderName, "Agentic Hub Shipper"),
            senderPhone: getVal(colIdx.senderPhone, "+91 98300 00000"),
            senderAddress: getVal(colIdx.senderAddress, "Ayantika Apartment, 76/B Selimpur Lane"),
            senderCity: getVal(colIdx.senderCity, "Kolkata"),
            senderState: getVal(colIdx.senderState, "West Bengal"),
            senderPincode: getVal(colIdx.senderPincode, "700031"),

            receiverName,
            receiverPhone: getVal(colIdx.receiverPhone, "+91 98000 00000"),
            receiverAddress: getVal(colIdx.receiverAddress, "Destination Delivery Address"),
            receiverCity: getVal(colIdx.receiverCity, "Kolkata"),
            receiverState: getVal(colIdx.receiverState, "West Bengal"),
            receiverPincode: getVal(colIdx.receiverPincode, "700001"),

            itemDescription: getVal(colIdx.itemDescription, "General Commercial Cargo"),
            packageWeight: Math.max(0.1, Number(getVal(colIdx.packageWeight)) || 1.0),
            lengthCm: Math.max(1, Number(getVal(colIdx.lengthCm)) || 20),
            widthCm: Math.max(1, Number(getVal(colIdx.widthCm)) || 15),
            heightCm: Math.max(1, Number(getVal(colIdx.heightCm)) || 10),

            paymentMode: pMode,
            serviceType: sType,
            totalAmount: Math.max(0, Number(getVal(colIdx.totalAmount)) || 0),
            declaredValue: Math.max(0, Number(getVal(colIdx.declaredValue)) || 0),
          });
        }

        if (rows.length === 0) {
          throw new Error(
            "No valid consignment rows found. Please ensure Receiver Name and required columns are present."
          );
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
