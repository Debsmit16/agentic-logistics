import { NextResponse } from "next/server";
import {
  getPartnerWebhookIntegration,
  setPartnerWebhookSecret,
} from "@/lib/admin/admin-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireApiPermission("partners.manage");
    const { id } = await params;
    const integration = await getPartnerWebhookIntegration(id);
    return NextResponse.json({
      webhookUrl: `/api/webhooks/partners/${id}`,
      hasSecret: Boolean(integration?.webhookSecret),
      webhookSecret: integration?.webhookSecret ?? "",
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireApiPermission("partners.manage");
    const { id } = await params;
    const body = z
      .object({ webhookSecret: z.string().nullable() })
      .parse(await request.json());
    await setPartnerWebhookSecret(id, body.webhookSecret);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
