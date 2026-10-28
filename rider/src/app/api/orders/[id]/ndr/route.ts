import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRiderSession } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getRiderSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const {
      reason,
      rescheduleDate,
      photoBase64,
      notes,
    } = body;

    if (!reason) {
      return NextResponse.json({ error: "Failure reason is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const desc = `NDR Exception: ${reason}${
        rescheduleDate ? ` · Rescheduled to: ${rescheduleDate}` : ""
      }${notes ? ` · Note: ${notes}` : ""}`;

      const milestone = await tx.orderMilestone.create({
        data: {
          orderId: id,
          status: order.status,
          title: `Delivery Attempted · ${reason}`,
          description: desc,
          performedBy: `${session.driverName} (${session.driverPhone})`,
        },
      });

      if (photoBase64 && typeof photoBase64 === "string") {
        const cleanBase64 = photoBase64.includes(",") ? photoBase64.split(",")[1] : photoBase64;
        const buffer = Buffer.from(cleanBase64, "base64");
        await tx.orderAttachment.create({
          data: {
            orderId: id,
            milestoneId: milestone.id,
            type: "MILESTONE_STEP",
            fileName: `ndr_${order.awbNumber}.webp`,
            mimeType: "image/webp",
            sizeBytes: buffer.length,
            data: buffer,
            caption: `NDR proof photo · ${reason}`,
          },
        });
      }

      return milestone;
    });

    return NextResponse.json({
      ok: true,
      milestone: result,
    });
  } catch (err: unknown) {
    console.error("Error logging NDR:", err);
    return NextResponse.json({ error: "Failed to record delivery exception." }, { status: 500 });
  }
}

