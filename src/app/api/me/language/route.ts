import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiUser } from "@/lib/api/route-helpers";
import { z } from "zod";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const { preferredLang } = z
      .object({ preferredLang: z.enum(["en", "bn", "hi"]) })
      .parse(await request.json());
    await prisma.user.update({
      where: { id: user.id },
      data: { preferredLang },
    });
    return NextResponse.json({ preferredLang });
  } catch (e) {
    return handleApiError(e);
  }
}
