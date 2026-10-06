import { NextResponse } from "next/server";
import { importParcelsFromCsv } from "@/lib/partners/import-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiPermission("partners.manage");
    const { id: partnerId } = await params;
    const form = await request.formData();
    const file = form.get("file");
    const warehouseId = form.get("warehouseId")?.toString();
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a CSV file." }, { status: 400 });
    }
    const csvText = await file.text();
    const result = await importParcelsFromCsv(
      partnerId,
      csvText,
      user.id,
      warehouseId,
    );
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
