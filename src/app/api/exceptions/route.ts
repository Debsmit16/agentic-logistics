import { NextResponse } from "next/server";
import { listExceptions, resolveException } from "@/lib/exceptions/service";
import { handleApiError, requireApiUser } from "@/lib/api/route-helpers";
import { z } from "zod";

export async function GET() {
  try {
    await requireApiUser();
    const exceptions = await listExceptions();
    return NextResponse.json({ exceptions });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireApiUser();
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    const exception = await resolveException(id);
    return NextResponse.json({ exception });
  } catch (e) {
    return handleApiError(e);
  }
}
