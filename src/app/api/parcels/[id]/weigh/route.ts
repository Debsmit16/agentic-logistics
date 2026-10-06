import { NextResponse } from "next/server";
import { z } from "zod";
import { weighParcel } from "@/lib/parcels/parcel-service";
import { requireUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({ weightKg: z.number().positive() });

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    if (!hasPermission(user.role, "parcels.receive")) {
      return NextResponse.json({ error: "You don't have access." }, { status: 403 });
    }
    const { id } = await params;
    const body = schema.parse(await request.json());
    const parcel = await weighParcel(id, body.weightKg, user.id);
    return NextResponse.json({ parcel });
  } catch (e) {
    const message = e instanceof Error ? e.message : "We couldn't save the weight.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
