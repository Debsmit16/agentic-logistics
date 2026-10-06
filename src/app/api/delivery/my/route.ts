import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiUser } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (user.role !== "DELIVERY_BOY") {
      return NextResponse.json({ error: "You don't have access." }, { status: 403 });
    }

    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryBoyId: user.id, isActive: true },
      include: {
        parcel: {
          select: {
            id: true,
            internalId: true,
            partnerAwb: true,
            status: true,
            receiverName: true,
            receiverPhone: true,
            addressLine1: true,
            city: true,
            pincode: true,
            paymentType: true,
            codAmount: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({ assignments });
  } catch (e) {
    return handleApiError(e);
  }
}
