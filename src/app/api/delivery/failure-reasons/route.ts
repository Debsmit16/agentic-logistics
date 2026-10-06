import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiUser } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiUser();
    const reasons = await prisma.deliveryFailureReason.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ reasons });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();
    const reason = await prisma.deliveryFailureReason.create({
      data: {
        code: body.code,
        label: body.label,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ reason });
  } catch (e) {
    return handleApiError(e);
  }
}
