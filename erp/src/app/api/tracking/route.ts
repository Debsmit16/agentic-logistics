import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { getConsignmentTracking } from "@/lib/tracking/tracking-service";

export async function GET(req: Request) {
  try {
    await requireApiPermission(AppModule.ORDERS, "canRead");
    const url = new URL(req.url);
    const q = url.searchParams.get("q");

    if (!q || !q.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const tracking = await getConsignmentTracking(q.trim(), true);
    if (!tracking) {
      return NextResponse.json({ error: "No consignment found matching reference" }, { status: 404 });
    }

    return NextResponse.json({ tracking });
  } catch (e) {
    return jsonError(e);
  }
}

