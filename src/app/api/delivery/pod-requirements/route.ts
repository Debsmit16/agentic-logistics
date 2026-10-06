import { NextResponse } from "next/server";
import { DEFAULT_POD, getSystemConfig } from "@/lib/config/system-config";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("delivery.execute");
    const pod = await getSystemConfig("pod.requirements", DEFAULT_POD);
    return NextResponse.json({ pod });
  } catch (e) {
    return handleApiError(e);
  }
}
