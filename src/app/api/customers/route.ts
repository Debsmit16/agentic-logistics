import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerRecord, listCustomers } from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET(request: Request) {
  try {
    await requireApiPermission("partners.manage");
    const q = new URL(request.url).searchParams.get("q") ?? undefined;
    const customers = await listCustomers(q);
    return NextResponse.json({ customers });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiPermission("partners.manage");
    const body = z
      .object({
        name: z.string().min(1),
        phone: z.string().min(6),
        email: z.string().email().optional(),
      })
      .parse(await request.json());
    const customer = await createCustomerRecord(body);
    return NextResponse.json({ customer });
  } catch (e) {
    return handleApiError(e);
  }
}
