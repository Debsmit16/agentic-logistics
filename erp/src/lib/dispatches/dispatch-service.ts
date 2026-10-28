import { AppModule, DispatchStatus, DispatchType, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit/log-audit";

export interface DispatchFilterParams {
  search?: string;
  status?: DispatchStatus;
  type?: DispatchType;
  page?: number;
  limit?: number;
}

export interface CreateDispatchInput {
  type: DispatchType;
  originHub?: string;
  destinationHub?: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  notes?: string;
  orderIds?: string[];
}

export interface UpdateDispatchInput {
  status?: DispatchStatus;
  type?: DispatchType;
  originHub?: string;
  destinationHub?: string | null;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string | null;
  addOrderIds?: string[];
  removeOrderIds?: string[];
}

function generateTripNumber(): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `DSP-${yearMonth}-${randomPart}`;
}

export async function listDispatches(params: DispatchFilterParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.DispatchTripWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.type) {
    where.type = params.type;
  }

  if (params.search) {
    const s = params.search.trim();
    where.OR = [
      { tripNumber: { contains: s, mode: "insensitive" } },
      { vehicleNumber: { contains: s, mode: "insensitive" } },
      { driverName: { contains: s, mode: "insensitive" } },
      { driverPhone: { contains: s, mode: "insensitive" } },
      { originHub: { contains: s, mode: "insensitive" } },
      { destinationHub: { contains: s, mode: "insensitive" } },
    ];
  }

  const [items, total, statsCounts, assignedOrdersCount, codSum] = await Promise.all([
    prisma.dispatchTrip.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { displayName: true, email: true },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            awbNumber: true,
            status: true,
            packageWeight: true,
            paymentMode: true,
            totalAmount: true,
            receiverCity: true,
          },
        },
      },
    }),
    prisma.dispatchTrip.count({ where }),
    prisma.dispatchTrip.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.count({
      where: { dispatchTripId: { not: null } },
    }),
    prisma.order.aggregate({
      where: { dispatchTripId: { not: null }, paymentMode: "COD" },
      _sum: { totalAmount: true },
    }),
  ]);

  const metrics = {
    totalTrips: 0,
    draftTrips: 0,
    dispatchedTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalAssignedOrders: assignedOrdersCount,
    totalCodAmount: Number(codSum._sum.totalAmount || 0),
    total: 0,
    draft: 0,
    dispatched: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const s of statsCounts) {
    metrics.totalTrips += s._count._all;
    metrics.total += s._count._all;
    if (s.status === DispatchStatus.DRAFT) {
      metrics.draftTrips = s._count._all;
      metrics.draft = s._count._all;
    }
    if (s.status === DispatchStatus.DISPATCHED) {
      metrics.dispatchedTrips = s._count._all;
      metrics.dispatched = s._count._all;
    }
    if (s.status === DispatchStatus.COMPLETED) {
      metrics.completedTrips = s._count._all;
      metrics.completed = s._count._all;
    }
    if (s.status === DispatchStatus.CANCELLED) {
      metrics.cancelledTrips = s._count._all;
      metrics.cancelled = s._count._all;
    }
  }

  // Calculate aggregates per trip
  const enrichedItems = items.map((trip) => {
    const orderCount = trip.orders.length;
    const totalWeight = trip.orders.reduce((sum, o) => sum + (o.packageWeight || 0), 0);
    const totalCod = trip.orders
      .filter((o) => o.paymentMode === "COD")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      ...trip,
      orderCount,
      totalWeight: Number(totalWeight.toFixed(2)),
      totalCod: Number(totalCod.toFixed(2)),
    };
  });

  return {
    items: enrichedItems,
    dispatches: enrichedItems,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    metrics,
  };
}

export async function getDispatchById(id: string) {
  const trip = await prisma.dispatchTrip.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, displayName: true, email: true },
      },
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
          thirdPartyName: true,
          thirdPartyTracking: true,
          createdAt: true,
        },
      },
    },
  });

  if (!trip) return null;

  const orderCount = trip.orders.length;
  const totalWeight = trip.orders.reduce((sum, o) => sum + (o.packageWeight || 0), 0);
  const totalCod = trip.orders
    .filter((o) => o.paymentMode === "COD")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return {
    ...trip,
    orderCount,
    totalWeight: Number(totalWeight.toFixed(2)),
    totalCod: Number(totalCod.toFixed(2)),
  };
}

export async function createDispatch(input: CreateDispatchInput, actorId?: string, actorName?: string) {
  let tripNumber = generateTripNumber();
  // Ensure uniqueness
  while (await prisma.dispatchTrip.findUnique({ where: { tripNumber } })) {
    tripNumber = generateTripNumber();
  }

  const trip = await prisma.$transaction(async (tx) => {
    const createdTrip = await tx.dispatchTrip.create({
      data: {
        tripNumber,
        type: input.type,
        originHub: input.originHub?.trim() || "Central Sorting Hub",
        destinationHub: input.destinationHub?.trim() || undefined,
        vehicleNumber: input.vehicleNumber.trim().toUpperCase(),
        driverName: input.driverName.trim(),
        driverPhone: input.driverPhone.trim(),
        notes: input.notes?.trim() || undefined,
        createdById: actorId,
        ...(input.orderIds && input.orderIds.length > 0
          ? {
              orders: {
                connect: input.orderIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        orders: true,
      },
    });

    // If orders were linked, add milestone audit to them
    if (input.orderIds && input.orderIds.length > 0) {
      for (const orderId of input.orderIds) {
        await tx.orderMilestone.create({
          data: {
            orderId,
            status: OrderStatus.CONFIRMED,
            title: `Assigned to Dispatch ${tripNumber}`,
            description: `Consignment staged for vehicle ${input.vehicleNumber.toUpperCase()} driven by ${input.driverName.trim()}`,
            location: input.originHub?.trim() || "Central Sorting Hub",
            performedBy: actorName || "Dispatch Controller",
          },
        });
      }
    }

    return createdTrip;
  });

  await logAudit({
    action: "DISPATCH_CREATE",
    module: AppModule.DISPATCHES,
    entityId: trip.id,
    userId: actorId,
    newValues: {
      tripNumber: trip.tripNumber,
      type: trip.type,
      vehicleNumber: trip.vehicleNumber,
      driverName: trip.driverName,
      orderCount: input.orderIds?.length || 0,
    },
  });

  return trip;
}

export async function updateDispatch(
  id: string,
  input: UpdateDispatchInput,
  actorId?: string,
  actorName?: string,
) {
  const current = await prisma.dispatchTrip.findUnique({
    where: { id },
    include: { orders: { select: { id: true, status: true } } },
  });

  if (!current) {
    throw new Error("Dispatch trip not found");
  }

  const statusChanged = input.status && input.status !== current.status;

  const updated = await prisma.$transaction(async (tx) => {
    // Connect / disconnect orders if requested
    const orderOperations: Prisma.OrderUpdateManyWithoutDispatchTripNestedInput = {};
    if (input.addOrderIds && input.addOrderIds.length > 0) {
      orderOperations.connect = input.addOrderIds.map((oId) => ({ id: oId }));
    }
    if (input.removeOrderIds && input.removeOrderIds.length > 0) {
      orderOperations.disconnect = input.removeOrderIds.map((oId) => ({ id: oId }));
    }

    const trip = await tx.dispatchTrip.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.originHub ? { originHub: input.originHub.trim() } : {}),
        ...(input.destinationHub !== undefined ? { destinationHub: input.destinationHub?.trim() || null } : {}),
        ...(input.vehicleNumber ? { vehicleNumber: input.vehicleNumber.trim().toUpperCase() } : {}),
        ...(input.driverName ? { driverName: input.driverName.trim() } : {}),
        ...(input.driverPhone ? { driverPhone: input.driverPhone.trim() } : {}),
        ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
        ...(Object.keys(orderOperations).length > 0 ? { orders: orderOperations } : {}),
      },
      include: {
        orders: true,
      },
    });

    // If trip status changed to DISPATCHED:
    // Update linked orders that are in CONFIRMED to IN_TRANSIT or OUT_FOR_DELIVERY
    if (statusChanged && input.status === DispatchStatus.DISPATCHED) {
      const targetOrderStatus =
        trip.type === DispatchType.LAST_MILE
          ? OrderStatus.OUT_FOR_DELIVERY
          : OrderStatus.IN_TRANSIT;

      for (const order of trip.orders) {
        if (order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.IN_TRANSIT) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: targetOrderStatus },
          });

          await tx.orderMilestone.create({
            data: {
              orderId: order.id,
              status: targetOrderStatus,
              title:
                trip.type === DispatchType.LAST_MILE
                  ? `Out for Delivery via Trip ${trip.tripNumber}`
                  : `Dispatched in Linehaul Trip ${trip.tripNumber}`,
              description: `Vehicle: ${trip.vehicleNumber} | Driver: ${trip.driverName} (${trip.driverPhone})`,
              location: trip.originHub,
              performedBy: actorName || "Dispatch Controller",
            },
          });
        }
      }
    }

    // If trip status changed to COMPLETED:
    if (statusChanged && input.status === DispatchStatus.COMPLETED) {
      for (const order of trip.orders) {
        await tx.orderMilestone.create({
          data: {
            orderId: order.id,
            status: order.status,
            title: `Dispatch Trip ${trip.tripNumber} Completed`,
            description: `Trip arrived at ${trip.destinationHub || "destination sector"}. Run-sheet closed.`,
            location: trip.destinationHub || trip.originHub,
            performedBy: actorName || "Hub Supervisor",
          },
        });
      }
    }

    // If orders were added, create staging milestones
    if (input.addOrderIds && input.addOrderIds.length > 0) {
      for (const orderId of input.addOrderIds) {
        await tx.orderMilestone.create({
          data: {
            orderId,
            status: OrderStatus.CONFIRMED,
            title: `Added to Dispatch ${trip.tripNumber}`,
            description: `Assigned to vehicle ${trip.vehicleNumber}`,
            location: trip.originHub,
            performedBy: actorName || "Dispatch Controller",
          },
        });
      }
    }

    return trip;
  });

  await logAudit({
    action: "DISPATCH_UPDATE",
    module: AppModule.DISPATCHES,
    entityId: id,
    userId: actorId,
    oldValues: {
      status: current.status,
      vehicleNumber: current.vehicleNumber,
      driverName: current.driverName,
    },
    newValues: {
      status: updated.status,
      vehicleNumber: updated.vehicleNumber,
      driverName: updated.driverName,
      orderCount: updated.orders.length,
    },
  });

  return updated;
}

export async function deleteDispatch(id: string, actorId?: string) {
  const trip = await prisma.dispatchTrip.findUnique({
    where: { id },
    include: { orders: true },
  });

  if (!trip) {
    throw new Error("Dispatch trip not found");
  }

  if (trip.status === DispatchStatus.DISPATCHED) {
    throw new Error("Cannot delete an active trip that is already dispatched. Please mark it Completed or Cancelled.");
  }

  // Disconnect orders
  await prisma.$transaction([
    prisma.order.updateMany({
      where: { dispatchTripId: id },
      data: { dispatchTripId: null },
    }),
    prisma.dispatchTrip.delete({
      where: { id },
    }),
  ]);

  await logAudit({
    action: "DISPATCH_DELETE",
    module: AppModule.DISPATCHES,
    entityId: id,
    userId: actorId,
    oldValues: {
      tripNumber: trip.tripNumber,
      orderCount: trip.orders.length,
    },
  });

  return true;
}

export async function getEligibleOrdersForDispatch() {
  // Orders that are CONFIRMED and not currently assigned to any active trip
  return prisma.order.findMany({
    where: {
      dispatchTripId: null,
      status: {
        in: [OrderStatus.CONFIRMED, OrderStatus.IN_TRANSIT],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      awbNumber: true,
      status: true,
      senderCity: true,
      receiverName: true,
      receiverAddress: true,
      receiverCity: true,
      receiverPincode: true,
      packageWeight: true,
      paymentMode: true,
      totalAmount: true,
      createdAt: true,
    },
  });
}
