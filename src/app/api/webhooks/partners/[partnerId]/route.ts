import { NextResponse } from "next/server";
import { handlePartnerWebhook } from "@/lib/webhooks/partner-webhook";
import { handleApiError } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ partnerId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { partnerId } = await params;
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody) as {
      eventType: string;
      partnerAwb?: string;
      idempotencyKey?: string;
      shipment?: Record<string, unknown>;
    };
    const result = await handlePartnerWebhook(partnerId, rawBody, {
      signature: request.headers.get("x-webhook-signature"),
      idempotencyKey: request.headers.get("idempotency-key"),
    }, payload);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
