import { prisma } from "@/lib/db";
import { AppModule, DispatchStatus, OrderStatus, PaymentMode } from "@prisma/client";

export interface SettlementDenominations {
  n500?: number;
  n200?: number;
  n100?: number;
  n50?: number;
  n20?: number;
  n10?: number;
  coins?: number;
}

export interface SettlementData {
  settledAt: string;
  reconciledById: string;
  reconciledByName: string;
  cashExpected: number;
  cashReceived: number;
  variance: number;
  notes?: string;
  denominations?: SettlementDenominations;
}

export async function getTripsForSettlement() {
  const trips = await prisma.dispatchTrip.findMany({
    where: {
      status: {
        in: [DispatchStatus.DISPATCHED, DispatchStatus.COMPLETED],
      },
    },
    include: {
      orders: {
        select: {
          id: true,
          awbNumber: true,
          orderNumber: true,
          status: true,
          paymentMode: true,
          totalAmount: true,
          receiverName: true,
          receiverCity: true,
          receiverPincode: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return trips.map((trip) => {
    // Parse settlement data from notes if settled
    let settlement: SettlementData | null = null;
    if (trip.notes && trip.notes.startsWith("{")) {
      try {
        settlement = JSON.parse(trip.notes);
      } catch {
        // regular notes string
      }
    }

    const totalStops = trip.orders.length;
    const deliveredStops = trip.orders.filter((o) => o.status === OrderStatus.DELIVERED);
    const ndrStops = trip.orders.filter((o) => o.status === OrderStatus.OUT_FOR_DELIVERY || o.status === OrderStatus.RTO);

    // Sum expected COD cash from delivered orders
    const codDeliveredOrders = deliveredStops.filter((o) => o.paymentMode === PaymentMode.COD);
    const totalCodExpected = codDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      id: trip.id,
      tripNumber: trip.tripNumber,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      vehicleNumber: trip.vehicleNumber,
      status: trip.status,
      originHub: trip.originHub,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      totalStops,
      deliveredCount: deliveredStops.length,
      ndrCount: ndrStops.length,
      codOrderCount: codDeliveredOrders.length,
      totalCodExpected,
      isReconciled: trip.status === DispatchStatus.COMPLETED && !!settlement,
      settlement,
      orders: trip.orders,
    };
  });
}

export async function reconcileDriverCash({
  tripId,
  cashReceived,
  denominations,
  notes,
  userId,
  userDisplayName,
}: {
  tripId: string;
  cashReceived: number;
  denominations?: SettlementDenominations;
  notes?: string;
  userId: string;
  userDisplayName: string;
}) {
  const trip = await prisma.dispatchTrip.findUnique({
    where: { id: tripId },
    include: {
      orders: true,
    },
  });

  if (!trip) {
    throw new Error("Dispatch trip not found");
  }

  // Calculate total COD cash expected from delivered orders
  const codDelivered = trip.orders.filter(
    (o) => o.status === OrderStatus.DELIVERED && o.paymentMode === PaymentMode.COD
  );
  const totalCodExpected = codDelivered.reduce((sum, o) => sum + o.totalAmount, 0);
  const variance = cashReceived - totalCodExpected;

  const settlementPayload: SettlementData = {
    settledAt: new Date().toISOString(),
    reconciledById: userId,
    reconciledByName: userDisplayName,
    cashExpected: totalCodExpected,
    cashReceived,
    variance,
    notes: notes?.trim() || undefined,
    denominations,
  };

  // Perform atomic transaction
  await prisma.$transaction(async (tx) => {
    // 1. Mark trip as COMPLETED and save structured settlement payload
    await tx.dispatchTrip.update({
      where: { id: trip.id },
      data: {
        status: DispatchStatus.COMPLETED,
        notes: JSON.stringify(settlementPayload),
      },
    });

    // 2. Append Cash Settlement Milestone to every COD order in the trip
    for (const order of codDelivered) {
      await tx.orderMilestone.create({
        data: {
          orderId: order.id,
          status: OrderStatus.DELIVERED,
          title: "COD Cash Reconciled & Deposited at Hub",
          description: `Driver ${trip.driverName} handed over physical cash deposit of ₹${order.totalAmount}. Verified and sealed by cashier ${userDisplayName}.`,
          location: trip.originHub,
          performedBy: userDisplayName,
        },
      });
    }

    // 3. Create Audit Log
    await tx.auditLog.create({
      data: {
        userId,
        module: AppModule.DISPATCHES,
        action: "CASH_SETTLEMENT_RECONCILED",
        entityId: trip.id,
        newValues: settlementPayload as unknown as object,
      },
    });
  });

  return {
    success: true,
    message: `Driver ${trip.driverName} reconciled successfully. Received: ₹${cashReceived} (Expected: ₹${totalCodExpected})`,
    tripId: trip.id,
    tripNumber: trip.tripNumber,
    settlement: settlementPayload,
  };
}

export async function getMerchantRemittanceList() {
  // Aggregate all DELIVERED COD orders across the system
  const deliveredCodOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      paymentMode: PaymentMode.COD,
    },
    select: {
      id: true,
      awbNumber: true,
      orderNumber: true,
      senderName: true,
      senderCity: true,
      receiverName: true,
      receiverCity: true,
      totalAmount: true,
      packageWeight: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  // Calculate merchant payout metrics
  // Standard Courier formula:
  // Freight Fee: ₹90 base + ₹25 per kg
  // COD Handling Fee: 1.5% of COD total
  // GST: 18% on (Freight + COD Handling)
  return deliveredCodOrders.map((order) => {
    const grossCod = order.totalAmount;
    const freightFee = Math.round(90 + Math.max(order.packageWeight - 1, 0) * 25);
    const codHandlingFee = Math.round(grossCod * 0.015);
    const taxableFreight = freightFee + codHandlingFee;
    const gst18 = Math.round(taxableFreight * 0.18);
    const totalDeductions = taxableFreight + gst18;
    const netPayout = Math.max(grossCod - totalDeductions, 0);

    return {
      orderId: order.id,
      awbNumber: order.awbNumber,
      orderNumber: order.orderNumber,
      merchantName: order.senderName,
      originCity: order.senderCity,
      recipientName: order.receiverName,
      destinationCity: order.receiverCity,
      deliveredAt: order.updatedAt.toISOString(),
      grossCod,
      freightFee,
      codHandlingFee,
      gst18,
      totalDeductions,
      netPayout,
      status: "READY_FOR_REMITTANCE",
    };
  });
}

