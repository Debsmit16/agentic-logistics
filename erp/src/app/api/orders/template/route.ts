import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";

export async function GET() {
  try {
    await requireApiPermission(AppModule.ORDERS, "canCreate");

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Agentic Logistics ERP";
    workbook.lastModifiedBy = "Agentic Logistics Freight Core";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("Consignment Booking Template", {
      views: [{ state: "frozen", ySplit: 3 }],
      properties: { tabColor: { argb: "FF0F172A" } },
    });

    // 1. Title Banner (Row 1)
    worksheet.mergeCells("A1:U1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "AGENTIC LOGISTICS ERP — BULK CONSIGNMENT BOOKING TEMPLATE";
    titleCell.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(1).height = 34;

    // 2. Instructions Subtitle (Row 2)
    worksheet.mergeCells("A2:U2");
    const subCell = worksheet.getCell("A2");
    subCell.value =
      "Instructions: Columns marked with * are mandatory. Use the in-cell dropdown arrows to select 'Payment Mode' and 'Service Category'. Enter dead weights and dimensions as positive numbers.";
    subCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF334155" } };
    subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    subCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 22;

    // 3. Column Headers (Row 3)
    const headers = [
      "Sender Name *",
      "Sender Phone *",
      "Sender Address *",
      "Sender City *",
      "Sender State *",
      "Sender PIN *",
      "Receiver Name *",
      "Receiver Phone *",
      "Receiver Address *",
      "Receiver City *",
      "Receiver State *",
      "Receiver PIN *",
      "Item Description *",
      "Package Weight (KG) *",
      "Length (CM)",
      "Width (CM)",
      "Height (CM)",
      "Payment Mode * [Dropdown]",
      "Service Category * [Dropdown]",
      "Tariff Amount (INR)",
      "Declared Value (INR)",
    ];

    const headerRow = worksheet.getRow(3);
    headerRow.values = headers;
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "medium", color: { argb: "FF0F172A" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });

    // 4. Sample Rows (Rows 4 and 5)
    const sample1 = [
      "Plexi Warehouse Tech",
      "9830112233",
      "Ayantika Apartment, 76/B Selimpur Lane",
      "Kolkata",
      "West Bengal",
      "700031",
      "Apex Robotics Labs",
      "9876543210",
      "Plot 44, Electronic City Phase 1",
      "Bengaluru",
      "Karnataka",
      "560100",
      "Precision Avionics Sensors",
      2.5,
      25,
      20,
      15,
      "PREPAID",
      "EXPRESS",
      1850,
      25000,
    ];

    const sample2 = [
      "Kolkata Textile Mills",
      "9830998877",
      "12 Park Street, Camac Area",
      "Kolkata",
      "West Bengal",
      "700016",
      "Metro Retail Hub",
      "9123456780",
      "88 Marine Drive, Nariman Point",
      "Mumbai",
      "Maharashtra",
      "400020",
      "Export Cotton Garments",
      8.0,
      50,
      40,
      30,
      "COD",
      "STANDARD",
      "3200",
      "45000",
    ];

    const row4 = worksheet.addRow(sample1);
    row4.height = 22;
    row4.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });

    const row5 = worksheet.addRow(sample2);
    row5.height = 22;
    row5.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });

    // 5. In-Cell Dropdown Data Validations for Rows 4 to 500
    for (let r = 4; r <= 500; r++) {
      // Payment Mode dropdown (Column 18 - R)
      worksheet.getCell(`R${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"PREPAID,COD"'],
        showErrorMessage: true,
        errorTitle: "Invalid Payment Mode",
        error: "Please select either PREPAID or COD from the dropdown list.",
        showInputMessage: true,
        promptTitle: "Payment Mode",
        prompt: "Select PREPAID or COD",
      };

      // Service Category dropdown (Column 19 - S)
      worksheet.getCell(`S${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"STANDARD,EXPRESS,COLD_CHAIN"'],
        showErrorMessage: true,
        errorTitle: "Invalid Service Category",
        error: "Please select STANDARD, EXPRESS, or COLD_CHAIN.",
        showInputMessage: true,
        promptTitle: "Service Category",
        prompt: "Select STANDARD, EXPRESS, or COLD_CHAIN",
      };

      // Formatting
      worksheet.getCell(`B${r}`).numFmt = "@"; // Sender Phone text
      worksheet.getCell(`F${r}`).numFmt = "@"; // Sender PIN text
      worksheet.getCell(`H${r}`).numFmt = "@"; // Receiver Phone text
      worksheet.getCell(`L${r}`).numFmt = "@"; // Receiver PIN text
      worksheet.getCell(`N${r}`).numFmt = "0.00"; // Weight
      worksheet.getCell(`O${r}`).numFmt = "0"; // Length
      worksheet.getCell(`P${r}`).numFmt = "0"; // Width
      worksheet.getCell(`Q${r}`).numFmt = "0"; // Height
      worksheet.getCell(`T${r}`).numFmt = "₹#,##0.00"; // Amount
      worksheet.getCell(`U${r}`).numFmt = "₹#,##0.00"; // Declared Value
    }

    // 6. Explicit Column Widths
    const colWidths = [
      26, // A: Sender Name
      18, // B: Sender Phone
      38, // C: Sender Address
      18, // D: Sender City
      18, // E: Sender State
      14, // F: Sender PIN
      26, // G: Receiver Name
      18, // H: Receiver Phone
      38, // I: Receiver Address
      18, // J: Receiver City
      18, // K: Receiver State
      14, // L: Receiver PIN
      30, // M: Item Description
      22, // N: Weight
      14, // O: Length
      14, // P: Width
      14, // Q: Height
      22, // R: Payment Mode
      24, // S: Service Category
      20, // T: Tariff Amount
      20, // U: Declared Value
    ];

    colWidths.forEach((w, idx) => {
      worksheet.getColumn(idx + 1).width = w;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="agentic_bulk_orders_template.xlsx"',
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
