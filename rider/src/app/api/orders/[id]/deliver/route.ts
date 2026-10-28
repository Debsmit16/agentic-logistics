import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRiderSession } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

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
      receivedBy = "Customer (Self)",
      signatureBase64,
      photoBase64,
      codCollected,
      codAmount,
      notes,
    } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { dispatchTrip: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Execute atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update order status to DELIVERED
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.DELIVERED,
        },
      });

      // 2. Format milestone description
      const codDetail = order.paymentMode === "COD" 
        ? ` · COD Cash Collected: ₹${codAmount || order.totalAmount}`
        : " · Prepaid Delivery";

      const milestoneDesc = `Handed over to: ${receivedBy}${codDetail}${notes ? ` · Note: ${notes}` : ""}`;

      // 3. Create audit milestone
      const milestone = await tx.orderMilestone.create({
        data: {
          orderId: id,
          status: OrderStatus.DELIVERED,
          title: "Package Delivered & e-POD Recorded",
          description: milestoneDesc,
          performedBy: `${session.driverName} (${session.driverPhone})`,
        },
      });

      // 4. Save doorstep photo attachment if provided
      if (photoBase64 && typeof photoBase64 === "string") {
        const cleanBase64 = photoBase64.includes(",") ? photoBase64.split(",")[1] : photoBase64;
        const buffer = Buffer.from(cleanBase64, "base64");
        await tx.orderAttachment.create({
          data: {
            orderId: id,
            milestoneId: milestone.id,
            type: "MILESTONE_STEP",
            fileName: `epod_${order.awbNumber}.webp`,
            mimeType: "image/webp",
            sizeBytes: buffer.length,
            data: buffer,
            caption: `Doorstep e-POD photo · Received by ${receivedBy}`,
          },
        });
      }

      // 5. Save recipient digital signature if provided
      if (signatureBase64 && typeof signatureBase64 === "string") {
        const cleanSig = signatureBase64.includes(",") ? signatureBase64.split(",")[1] : signatureBase64;
        const sigBuffer = Buffer.from(cleanSig, "base64");
        await tx.orderAttachment.create({
          data: {
            orderId: id,
            milestoneId: milestone.id,
            type: "MILESTONE_STEP",
            fileName: `sig_${order.awbNumber}.png`,
            mimeType: "image/png",
            sizeBytes: sigBuffer.length,
            data: sigBuffer,
            caption: `Digital recipient signature · ${receivedBy}`,
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({
      ok: true,
      order: updated,
    });
  } catch (err: unknown) {
    console.error("Error submitting e-POD delivery:", err);
    return NextResponse.json({ error: "Failed to record delivery." }, { status: 500 });
  }
}

