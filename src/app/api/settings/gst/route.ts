import { NextResponse } from "next/server";
import { getGstProfile, saveGstProfile } from "@/lib/finance/gst-invoice-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";
import { z } from "zod";

export async function GET() {
  try {
    await requireApiPermission("gst.manage");
    const profile = await getGstProfile();
    return NextResponse.json({ profile });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: Request) {
  try {
    await requireApiPermission("gst.manage");
    const profile = z
      .object({
        legalName: z.string().min(1),
        gstin: z.string().min(5),
        address: z.string().min(1),
        stateCode: z.string().min(2),
        defaultFreightRatePerKg: z.number().positive(),
        gstRatePercent: z.number().min(0).max(28),
      })
      .parse(await request.json());
    await saveGstProfile(profile);
    return NextResponse.json({ profile });
  } catch (e) {
    return handleApiError(e);
  }
}
