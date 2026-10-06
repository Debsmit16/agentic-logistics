import { NextResponse } from "next/server";
import { codSummary, createSettlement, listCodLedger } from "@/lib/finance/cod-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";
import { z } from "zod";

export async function GET() {
  try {
    await requireApiPermission("cod.manage");
    const [ledger, summary] = await Promise.all([listCodLedger(), codSummary()]);
    return NextResponse.json({ ledger, summary });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiPermission("cod.manage");
    const body = z
      .object({
        reference: z.string().min(1),
        partnerId: z.string().optional(),
        transactionIds: z.array(z.string()).min(1),
        note: z.string().optional(),
      })
      .parse(await request.json());
    const settlement = await createSettlement({ ...body, actorId: user.id });
    return NextResponse.json({ settlement });
  } catch (e) {
    return handleApiError(e);
  }
}
