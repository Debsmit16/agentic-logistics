import { prisma } from "@/lib/db";
import { OrderStatus, AppModule } from "@prisma/client";

export type NdrActionType = "REATTEMPT" | "RTO" | "RESCHEDULE";

export async function getNdrOrders() {
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { ndrReason: { not: null } },
        { status: OrderStatus.RTO },
        {
          AND: [
            { status: OrderStatus.OUT_FOR_DELIVERY },
            { deliveryNotes: { contains: "NDR" } },
          ],
        },
      ],
    },
    include: {
      dispatchTrip: {
        select: {
          id: true,
          tripNumber: true,
          driverName: true,
          driverPhone: true,
          vehicleNumber: true,
        },
      },
      milestones: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return orders.map((o) => ({
    id: o.id,
    awbNumber: o.awbNumber,
    orderNumber: o.orderNumber,
    status: o.status,
    ndrReason: o.ndrReason || "Delivery Attempt Unsuccessful",
    receiverName: o.receiverName,
    receiverPhone: o.receiverPhone,
    receiverCity: o.receiverCity,
    receiverPincode: o.receiverPincode,
    receiverAddress: o.receiverAddress,
    paymentMode: o.paymentMode,
    totalAmount: o.totalAmount,
    packageWeight: o.packageWeight,
    driverName: o.dispatchTrip?.driverName || "Assigned Driver",
    driverPhone: o.dispatchTrip?.driverPhone || "",
    vehicleNumber: o.dispatchTrip?.vehicleNumber || "",
    tripNumber: o.dispatchTrip?.tripNumber || "",
    latestMilestone: o.milestones[0]?.title || null,
    updatedAt: o.updatedAt.toISOString(),
  }));
}

export async function resolveNdrAction({
  orderId,
  action,
  preferredDate,
  preferredSlot,
  notes,
  userId,
  userDisplayName,
}: {
  orderId: string;
  action: NdrActionType;
  preferredDate?: string;
  preferredSlot?: string;
  notes?: string;
  userId: string;
  userDisplayName: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Consignment not found");
  }

  return await prisma.$transaction(async (tx) => {
    if (action === "REATTEMPT") {
      // Re-queue for next dispatch run
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          ndrReason: null,
          deliveryNotes: notes ? `Dispatcher Reattempt Note: ${notes}` : "Re-queued for next-day delivery attempt.",
        },
      });

      await tx.orderMilestone.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          title: "Re-attempt Approved by Dispatch Desk",
          description: notes || "Consignment cleared for re-attempt on next active delivery runsheet.",
          location: "Central Sorting Facility",
          performedBy: userDisplayName,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          module: AppModule.ORDERS,
          action: "NDR_REATTEMPT_APPROVED",
          entityId: order.id,
          newValues: { orderId: order.id, action },
        },
      });

      return {
        success: true,
        message: `AWB ${order.awbNumber} successfully re-queued for delivery attempt.`,
        order: updated,
      };
    } else if (action === "RTO") {
      // Initiate Return to Origin
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.RTO,
          ndrReason: notes || "Customer Refused / Multiple Unsuccessful Attempts - Return to Origin initiated.",
        },
      });

      await tx.orderMilestone.create({
        data: {
          orderId: order.id,
          status: OrderStatus.RTO,
          title: "Return to Origin (RTO) Initiated",
          description: `Consignment flagged for reverse haulage back to merchant ${order.senderName} (${order.senderCity}).`,
          location: "Central Sorting Facility",
          performedBy: userDisplayName,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          module: AppModule.ORDERS,
          action: "NDR_RTO_INITIATED",
          entityId: order.id,
          newValues: { orderId: order.id, action },
        },
      });

      return {
        success: true,
        message: `AWB ${order.awbNumber} flagged for RTO Return to Origin.`,
        order: updated,
      };
    } else {
      // Reschedule Handover
      const slotText = preferredSlot ? ` (${preferredSlot})` : "";
      const dateText = preferredDate ? ` on ${preferredDate}` : " on requested date";

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          ndrReason: `Rescheduled for ${preferredDate || "Customer Requested Date"}`,
          deliveryNotes: `Rescheduled: ${preferredDate}${slotText}. Notes: ${notes || "None"}`,
        },
      });

      await tx.orderMilestone.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          title: `Delivery Rescheduled for ${dateText}${slotText}`,
          description: `Customer requested delivery slot. Instructions: ${notes || "Contact before arrival"}.`,
          location: "Central Sorting Facility",
          performedBy: userDisplayName,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          module: AppModule.ORDERS,
          action: "NDR_RESCHEDULED",
          entityId: order.id,
          newValues: { orderId: order.id, preferredDate, preferredSlot },
        },
      });

      return {
        success: true,
        message: `AWB ${order.awbNumber} rescheduled for ${dateText}${slotText}.`,
        order: updated,
      };
    }
  });
}

export async function customerSelfReschedule({
  awbNumber,
  preferredDate,
  preferredSlot,
  alternatePhone,
  deliveryNotes,
}: {
  awbNumber: string;
  preferredDate: string;
  preferredSlot: string;
  alternatePhone?: string;
  deliveryNotes?: string;
}) {
  const cleanAwb = awbNumber.replace(/^\*+|\*+$/g, "").trim().toUpperCase();

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ awbNumber: cleanAwb }, { orderNumber: cleanAwb }],
    },
  });

  if (!order) {
    throw new Error(`Consignment '${cleanAwb}' not found`);
  }

  if (order.status === OrderStatus.DELIVERED) {
    throw new Error("This consignment has already been delivered.");
  }

  const slotLabel = preferredSlot === "MORNING" ? "Morning (9 AM - 1 PM)" : "Afternoon (1 PM - 6 PM)";

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CONFIRMED,
        ndrReason: `Customer Self-Rescheduled for ${preferredDate} (${slotLabel})`,
        deliveryNotes: `Customer portal self-service: Preferred ${preferredDate} [${slotLabel}]. Alt Phone: ${alternatePhone || "None"}. Notes: ${deliveryNotes || "None"}`,
      },
    });

    await tx.orderMilestone.create({
      data: {
        orderId: order.id,
        status: OrderStatus.CONFIRMED,
        title: `Customer Self-Rescheduled for ${preferredDate}`,
        description: `Consignee selected preferred delivery slot: ${slotLabel}.${alternatePhone ? ` Alternate Phone: ${alternatePhone}.` : ""} ${deliveryNotes ? ` Note: "${deliveryNotes}"` : ""}`,
        location: `${order.receiverCity} Distribution Hub`,
        performedBy: "Customer Self-Service (Web Portal)",
      },
    });

    return {
      success: true,
      message: `Delivery successfully rescheduled for ${preferredDate} (${slotLabel}). Our courier rider will arrive during your selected window!`,
      awbNumber: updated.awbNumber,
      status: updated.status,
    };
  });
}

