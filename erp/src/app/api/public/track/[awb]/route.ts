import { NextResponse } from "next/server";
import { getConsignmentTracking } from "@/lib/tracking/tracking-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { awb } = await params;
    if (!awb || !awb.trim()) {
      return NextResponse.json(
        { error: "AWB or Order Number is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    }

    const tracking = await getConsignmentTracking(awb, false);
    if (!tracking) {
      return NextResponse.json(
        { error: "No shipment found for the provided AWB or Order reference" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    }

    return NextResponse.json(
      { tracking },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Public tracking error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve shipment tracking details" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

