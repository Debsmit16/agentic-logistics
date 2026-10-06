import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateTaxInvoiceForParcel,
  getGstProfile,
  listTaxInvoices,
  saveGstProfile,
} from "@/lib/finance/gst-invoice-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("gst.manage");
    const invoices = await listTaxInvoices();
    return NextResponse.json({ invoices });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiPermission("gst.manage");
    const { parcelId } = z.object({ parcelId: z.string() }).parse(await request.json());
    const invoice = await generateTaxInvoiceForParcel(parcelId);
    return NextResponse.json({ invoice });
  } catch (e) {
    return handleApiError(e);
  }
}
