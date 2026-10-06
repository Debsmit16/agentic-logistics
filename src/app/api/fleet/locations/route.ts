import { NextResponse } from "next/server";
import { listActiveFleetLocations } from "@/lib/fleet/fleet-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("fleet.view");
    const locations = await listActiveFleetLocations(15);
    return NextResponse.json({ locations });
  } catch (e) {
    return handleApiError(e);
  }
}
