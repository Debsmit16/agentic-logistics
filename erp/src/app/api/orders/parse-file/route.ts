import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { AppModule, PaymentMode, ServiceType } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";

function normalizeHeaderKey(header: string): string {
  return String(header || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const cleanText = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++;
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
        // skip
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

export async function POST(req: Request) {
  try {
    await requireApiPermission(AppModule.ORDERS, "canCreate");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let matrix: string[][] = [];

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return NextResponse.json({ error: "Uploaded Excel workbook contains no worksheets" }, { status: 400 });
      }

      worksheet.eachRow({ includeEmpty: false }, (row) => {
        const rowValues: string[] = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          let val = cell.value;
          if (val && typeof val === "object") {
            if ("text" in val && typeof val.text === "string") {
              val = val.text;
            } else if ("result" in val) {
              val = val.result;
            }
          }
          rowValues.push(val !== null && val !== undefined ? String(val).trim() : "");
        });
        if (rowValues.some((v) => v !== "")) {
          matrix.push(rowValues);
        }
      });
    } else {
      const text = await file.text();
      matrix = parseCsv(text);
    }

    if (matrix.length === 0) {
      return NextResponse.json({ error: "File appears to be empty" }, { status: 400 });
    }

    // Locate header row by searching for "sender" or "receiver" keywords
    let headerRowIndex = -1;
    for (let r = 0; r < Math.min(10, matrix.length); r++) {
      const joined = matrix[r].map(normalizeHeaderKey).join(" ");
      if (joined.includes("sender") && (joined.includes("receiver") || joined.includes("item") || joined.includes("weight"))) {
        headerRowIndex = r;
        break;
      }
    }

    // Fallback: row 0 is header
    if (headerRowIndex === -1) {
      headerRowIndex = 0;
    }

    const rawHeaders = matrix[headerRowIndex];
    const normalizedHeaders = rawHeaders.map(normalizeHeaderKey);

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

    const parsedRows = [];

    for (let i = headerRowIndex + 1; i < matrix.length; i++) {
      const row = matrix[i];
      if (!row || row.length === 0 || row.every((c) => !c.trim())) continue;

      const getVal = (idx: number, fallback = ""): string => {
        return idx !== -1 && row[idx] !== undefined ? row[idx].trim() : fallback;
      };

      const receiverName = getVal(colIdx.receiverName);
      if (!receiverName) continue; // Skip empty rows or trailing notes

      const pModeRaw = getVal(colIdx.paymentMode, "PREPAID").toUpperCase();
      const pMode = pModeRaw.includes("COD") ? PaymentMode.COD : PaymentMode.PREPAID;

      const sTypeRaw = getVal(colIdx.serviceType, "STANDARD").toUpperCase();
      let sType: ServiceType = ServiceType.STANDARD;
      if (sTypeRaw.includes("EXPRESS")) sType = ServiceType.EXPRESS;
      if (sTypeRaw.includes("COLD")) sType = ServiceType.COLD_CHAIN;

      parsedRows.push({
        senderName: getVal(colIdx.senderName, "Agentic Hub Shipper"),
        senderPhone: getVal(colIdx.senderPhone, "9830000000"),
        senderAddress: getVal(colIdx.senderAddress, "Ayantika Apartment, 76/B Selimpur Lane"),
        senderCity: getVal(colIdx.senderCity, "Kolkata"),
        senderState: getVal(colIdx.senderState, "West Bengal"),
        senderPincode: getVal(colIdx.senderPincode, "700031"),

        receiverName,
        receiverPhone: getVal(colIdx.receiverPhone, "9800000000"),
        receiverAddress: getVal(colIdx.receiverAddress, "Destination Delivery Address"),
        receiverCity: getVal(colIdx.receiverCity, "Kolkata"),
        receiverState: getVal(colIdx.receiverState, "West Bengal"),
        receiverPincode: getVal(colIdx.receiverPincode, "700001"),

        itemDescription: getVal(colIdx.itemDescription, "General Commercial Cargo"),
        packageWeight: Math.max(0.1, Number(getVal(colIdx.packageWeight).replace(/[^0-9.]/g, "")) || 1.0),
        lengthCm: Math.max(1, Number(getVal(colIdx.lengthCm).replace(/[^0-9.]/g, "")) || 20),
        widthCm: Math.max(1, Number(getVal(colIdx.widthCm).replace(/[^0-9.]/g, "")) || 15),
        heightCm: Math.max(1, Number(getVal(colIdx.heightCm).replace(/[^0-9.]/g, "")) || 10),

        paymentMode: pMode,
        serviceType: sType,
        totalAmount: Math.max(0, Number(getVal(colIdx.totalAmount).replace(/[^0-9.]/g, "")) || 0),
        declaredValue: Math.max(0, Number(getVal(colIdx.declaredValue).replace(/[^0-9.]/g, "")) || 0),
      });
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: "No valid consignment rows found. Please check columns and ensure Receiver Name is provided." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      count: parsedRows.length,
      rows: parsedRows,
    });
  } catch (e) {
    return jsonError(e);
  }
}
