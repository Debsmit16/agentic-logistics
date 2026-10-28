import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRiderSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getRiderSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active trip matching driver's phone
    const trip = await prisma.dispatchTrip.findFirst({
      where: {
        driverPhone: { contains: session.driverPhone },
        status: { in: ["DISPATCHED", "DRAFT"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            orderNumber: true,
            awbNumber: true,
            status: true,
            receiverName: true,
            receiverPhone: true,
            receiverAddress: true,
            receiverCity: true,
            receiverState: true,
            receiverPincode: true,
            itemDescription: true,
            packageWeight: true,
            paymentMode: true,
            totalAmount: true,
            createdAt: true,
            milestones: {
              orderBy: { createdAt: "desc" },
              take: 2,
              select: {
                title: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      // If no active dispatched/draft trip, check if there is any recent trip
      const recentTrip = await prisma.dispatchTrip.findFirst({
        where: { driverPhone: { contains: session.driverPhone } },
        orderBy: { createdAt: "desc" },
        include: {
          orders: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              orderNumber: true,
              awbNumber: true,
              status: true,
              receiverName: true,
              receiverPhone: true,
              receiverAddress: true,
              receiverCity: true,
              receiverState: true,
              receiverPincode: true,
              itemDescription: true,
              packageWeight: true,
              paymentMode: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json({
        trip: recentTrip,
        hasActiveTrip: false,
      });
    }

    // Calculate shift metrics
    const totalParcels = trip.orders.length;
    const deliveredParcels = trip.orders.filter((o) => o.status === "DELIVERED").length;
    const pendingParcels = trip.orders.filter(
      (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED" && o.status !== "RTO"
    ).length;

    // COD collections
    const deliveredCod = trip.orders
      .filter((o) => o.status === "DELIVERED" && o.paymentMode === "COD")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingCod = trip.orders
      .filter((o) => o.status !== "DELIVERED" && o.paymentMode === "COD")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return NextResponse.json({
      hasActiveTrip: true,
      trip: {
        id: trip.id,
        tripNumber: trip.tripNumber,
        status: trip.status,
        type: trip.type,
        vehicleNumber: trip.vehicleNumber,
        driverName: trip.driverName,
        driverPhone: trip.driverPhone,
        originHub: trip.originHub,
        destinationHub: trip.destinationHub,
        notes: trip.notes,
        createdAt: trip.createdAt,
        orders: trip.orders,
      },
      metrics: {
        totalParcels,
        deliveredParcels,
        pendingParcels,
        deliveredCod,
        pendingCod,
      },
    });
  } catch (err: unknown) {
    console.error("Error fetching active trip:", err);
    return NextResponse.json({ error: "Failed to load active trip" }, { status: 500 });
  }
}

