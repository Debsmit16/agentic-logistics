import { NextResponse } from "next/server";
import { findParcelByScan } from "@/lib/parcels/parcel-service";
import { requireUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!hasPermission(user.role, "parcels.read")) {
      return NextResponse.json({ error: "You don't have access." }, { status: 403 });
    }
    const q = new URL(request.url).searchParams.get("q");
    if (!q) {
      return NextResponse.json({ error: "Enter AWB or barcode." }, { status: 400 });
    }
    const parcel = await findParcelByScan(q.trim());
    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found." }, { status: 404 });
    }
    return NextResponse.json({ parcel });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
