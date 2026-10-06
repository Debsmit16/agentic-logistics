import { NextResponse } from "next/server";
import {
  DEFAULT_POD,
  getSystemConfig,
  setSystemConfig,
} from "@/lib/config/system-config";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";
import { z } from "zod";

export async function GET() {
  try {
    await requireApiPermission("warehouses.manage");
    const pod = await getSystemConfig("pod.requirements", DEFAULT_POD);
    return NextResponse.json({ pod });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: Request) {
  try {
    await requireApiPermission("warehouses.manage");
    const pod = z
      .object({
        requireOtp: z.boolean(),
        requirePhoto: z.boolean(),
        requireSignature: z.boolean(),
        requireGps: z.boolean(),
      })
      .parse(await request.json());
    await setSystemConfig("pod.requirements", pod);
    return NextResponse.json({ pod });
  } catch (e) {
    return handleApiError(e);
  }
}
