import { NextResponse } from "next/server";
import { customerSelfReschedule } from "@/lib/ndr/ndr-service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { awbNumber, preferredDate, preferredSlot, alternatePhone, deliveryNotes } = body;

    if (!awbNumber || !preferredDate || !preferredSlot) {
      return NextResponse.json(
        { error: "AWB Number, preferred date, and delivery slot are required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
        }
      );
    }

    const result = await customerSelfReschedule({
      awbNumber,
      preferredDate,
      preferredSlot,
      alternatePhone,
      deliveryNotes,
    });

    return NextResponse.json(
      { result },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reschedule handover";
    return NextResponse.json(
      { error: message },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

