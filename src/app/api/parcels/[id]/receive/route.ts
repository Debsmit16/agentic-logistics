import { NextResponse } from "next/server";
import { receiveParcel } from "@/lib/parcels/parcel-service";
import { requireUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    if (!hasPermission(user.role, "parcels.receive")) {
      return NextResponse.json({ error: "You don't have access." }, { status: 403 });
    }
    const { id } = await params;
    const parcel = await receiveParcel(id, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    const message = e instanceof Error ? e.message : "We couldn't save the parcel.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
