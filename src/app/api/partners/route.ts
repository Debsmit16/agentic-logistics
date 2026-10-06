import { NextResponse } from "next/server";
import { z } from "zod";
import { createPartner, listPartners, updatePartner } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission, requireApiUser } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiUser();
    const partners = await listPartners();
    return NextResponse.json({ partners });
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireApiPermission("partners.manage");
    const body = createSchema.parse(await request.json());
    const partner = await createPartner(body);
    return NextResponse.json({ partner });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireApiPermission("partners.manage");
    const body = z
      .object({
        id: z.string(),
        name: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(await request.json());
    const partner = await updatePartner(body.id, body);
    return NextResponse.json({ partner });
  } catch (e) {
    return handleApiError(e);
  }
}
