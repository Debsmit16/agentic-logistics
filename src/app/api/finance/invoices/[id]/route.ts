import { NextResponse } from "next/server";
import { getTaxInvoice } from "@/lib/finance/gst-invoice-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireApiPermission("gst.manage");
    const { id } = await params;
    const invoice = await getTaxInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (e) {
    return handleApiError(e);
  }
}
