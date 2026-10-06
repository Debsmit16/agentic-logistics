import { NextResponse } from "next/server";
import { z } from "zod";
import { recordFleetPing } from "@/lib/fleet/fleet-service";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function POST(request: Request) {
  try {
    const user = await requireApiPermission("fleet.track");
    const body = z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        accuracyM: z.number().optional(),
        speedKmh: z.number().optional(),
        headingDeg: z.number().optional(),
      })
      .parse(await request.json());

    await recordFleetPing({ userId: user.id, ...body });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
