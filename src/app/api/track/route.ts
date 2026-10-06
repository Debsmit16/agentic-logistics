import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Enter a tracking number." }, { status: 400 });
  }

  const parcel = await prisma.parcel.findFirst({
    where: { OR: [{ partnerAwb: q }, { internalId: q }] },
    select: {
      internalId: true,
      partnerAwb: true,
      status: true,
      updatedAt: true,
      events: {
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, eventType: true, message: true },
      },
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Tracking number not found." }, { status: 404 });
  }

  return NextResponse.json({ parcel });
}
