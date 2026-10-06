import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assignParcelToDeliveryBoy,
  createDeliveryBatch,
} from "@/lib/delivery/delivery-service";
import { prisma } from "@/lib/db";
import { handleApiError, requireApiPermission } from "@/lib/api/route-helpers";

export async function GET() {
  try {
    await requireApiPermission("delivery.manage");
    const batches = await prisma.deliveryBatch.findMany({
      include: {
        parcels: { select: { id: true, internalId: true, status: true } },
        assignments: {
          include: {
            deliveryBoy: { select: { displayName: true } },
            parcel: { select: { internalId: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ batches });
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  warehouseId: z.string(),
  parcelIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiPermission("delivery.manage");
    const body = createSchema.parse(await request.json());
    const batch = await createDeliveryBatch(body.warehouseId, body.parcelIds, user.id);
    return NextResponse.json({ batch });
  } catch (e) {
    return handleApiError(e);
  }
}

const assignSchema = z.object({
  batchId: z.string(),
  parcelId: z.string(),
  deliveryBoyId: z.string(),
});

export async function PUT(request: Request) {
  try {
    const user = await requireApiPermission("delivery.manage");
    const body = assignSchema.parse(await request.json());
    const assignment = await assignParcelToDeliveryBoy({ ...body, actorId: user.id });
    return NextResponse.json({ assignment });
  } catch (e) {
    return handleApiError(e);
  }
}
