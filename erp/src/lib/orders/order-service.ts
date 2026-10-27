import { AppModule, OrderStatus, PaymentMode, Prisma, ServiceType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit/log-audit";

export interface OrderFilterParams {
  search?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface CreateOrderInput {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;

  itemDescription: string;
  packageWeight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;

  paymentMode: PaymentMode;
  serviceType: ServiceType;
  totalAmount: number;
  declaredValue: number;
  status?: OrderStatus;
}

export interface UpdateOrderInput extends Partial<CreateOrderInput> {
  status?: OrderStatus;
  deliveryNotes?: string;
  ndrReason?: string;
  statusLocation?: string;
}

export function computeWeights(deadWeight: number, lengthCm: number, widthCm: number, heightCm: number) {
  const vol = Number(((lengthCm * widthCm * heightCm) / 5000).toFixed(2));
  const chargeable = Number(Math.max(deadWeight, vol).toFixed(2));
  return { volumetricWeight: vol, chargeableWeight: chargeable };
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `ORD-${timestamp}-${random}`;
}

export function generateAwbNumber() {
  const random = Math.floor(100000000 + Math.random() * 900000000);
  return `AWB-${random}`;
}

function getDefaultMilestoneTitle(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return "Consignment Booked & Confirmed";
    case OrderStatus.IN_TRANSIT:
      return "Dispatched & In Transit";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Out for Delivery";
    case OrderStatus.DELIVERED:
      return "Successfully Delivered";
    case OrderStatus.CANCELLED:
      return "Consignment Cancelled";
    case OrderStatus.RTO:
      return "Return to Origin (RTO) Initiated";
    case OrderStatus.DRAFT:
      return "Draft Created";
    default:
      return "Status Updated";
  }
}

function getDefaultMilestoneDescription(status: OrderStatus, awb: string): string {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return `Consignment booked with AWB ${awb}. Assigned to origin dispatch facility.`;
    case OrderStatus.IN_TRANSIT:
      return "Shipment departed origin hub via linehaul freight network.";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Consignment assigned to courier agent for final-mile destination delivery.";
    case OrderStatus.DELIVERED:
      return "Consignment received and acknowledged by consignee.";
    case OrderStatus.CANCELLED:
      return "Order cancelled per shipper or operational request.";
    case OrderStatus.RTO:
      return "Non-delivery event logged. Package routed back to sender facility.";
    default:
      return `Shipment status transitioned to ${status}.`;
  }
}

export async function listOrders(params: OrderFilterParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(1, params.limit ?? 25), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { awbNumber: { contains: q, mode: "insensitive" } },
      { senderName: { contains: q, mode: "insensitive" } },
      { receiverName: { contains: q, mode: "insensitive" } },
      { receiverPhone: { contains: q, mode: "insensitive" } },
      { receiverCity: { contains: q, mode: "insensitive" } },
      { receiverPincode: { contains: q, mode: "insensitive" } },
      { itemDescription: { contains: q, mode: "insensitive" } },
    ];
  }

  const [orders, total, totalOrders, inPipeline, outForDelivery, deliveredCount, rtoCount, revenueAgg] =
    await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, displayName: true, email: true },
          },
          milestones: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: [OrderStatus.CONFIRMED, OrderStatus.IN_TRANSIT] } },
      }),
      prisma.order.count({
        where: { status: OrderStatus.OUT_FOR_DELIVERY },
      }),
      prisma.order.count({
        where: { status: OrderStatus.DELIVERED },
      }),
      prisma.order.count({
        where: { status: { in: [OrderStatus.CANCELLED, OrderStatus.RTO] } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    metrics: {
      totalOrders,
      inPipeline,
      outForDelivery,
      delivered: deliveredCount,
      rtoCount,
      totalRevenue: revenueAgg._sum.totalAmount ?? 0,
    },
  };
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, displayName: true, email: true },
      },
      milestones: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createOrder(input: CreateOrderInput, actorId: string, actorName?: string) {
  const { volumetricWeight, chargeableWeight } = computeWeights(
    input.packageWeight,
    input.lengthCm,
    input.widthCm,
    input.heightCm,
  );

  const orderNumber = generateOrderNumber();
  const awbNumber = generateAwbNumber();
  const initialStatus = input.status ?? OrderStatus.CONFIRMED;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      awbNumber,
      status: initialStatus,
      paymentMode: input.paymentMode,
      serviceType: input.serviceType,

      senderName: input.senderName.trim(),
      senderPhone: input.senderPhone.trim(),
      senderAddress: input.senderAddress.trim(),
      senderCity: input.senderCity.trim(),
      senderState: input.senderState.trim(),
      senderPincode: input.senderPincode.trim(),

      receiverName: input.receiverName.trim(),
      receiverPhone: input.receiverPhone.trim(),
      receiverAddress: input.receiverAddress.trim(),
      receiverCity: input.receiverCity.trim(),
      receiverState: input.receiverState.trim(),
      receiverPincode: input.receiverPincode.trim(),

      itemDescription: input.itemDescription.trim(),
      packageWeight: input.packageWeight,
      lengthCm: input.lengthCm,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
      volumetricWeight,
      chargeableWeight,

      totalAmount: input.totalAmount,
      declaredValue: input.declaredValue,
      createdById: actorId,

      milestones: {
        create: {
          status: initialStatus,
          title: getDefaultMilestoneTitle(initialStatus),
          description: getDefaultMilestoneDescription(initialStatus, awbNumber),
          location: `${input.senderCity.trim()} Origin Hub`,
          performedBy: actorName || "Operations Dispatcher",
        },
      },
    },
    include: {
      milestones: true,
    },
  });

  await logAudit({
    action: "ORDER_CREATE",
    module: AppModule.ORDERS,
    entityId: order.id,
    userId: actorId,
    newValues: {
      orderNumber: order.orderNumber,
      awbNumber: order.awbNumber,
      status: order.status,
      receiverCity: order.receiverCity,
      chargeableWeight: order.chargeableWeight,
    },
  });

  return order;
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput,
  actorId: string,
  actorName?: string,
) {
  const existing = await prisma.order.findUniqueOrThrow({ where: { id } });

  const deadWeight = input.packageWeight ?? existing.packageWeight;
  const l = input.lengthCm ?? existing.lengthCm;
  const w = input.widthCm ?? existing.widthCm;
  const h = input.heightCm ?? existing.heightCm;

  const { volumetricWeight, chargeableWeight } = computeWeights(deadWeight, l, w, h);

  const statusChanged = input.status && input.status !== existing.status;

  const data: Prisma.OrderUpdateInput = {
    ...(input.status && { status: input.status }),
    ...(input.paymentMode && { paymentMode: input.paymentMode }),
    ...(input.serviceType && { serviceType: input.serviceType }),

    ...(input.senderName !== undefined && { senderName: input.senderName.trim() }),
    ...(input.senderPhone !== undefined && { senderPhone: input.senderPhone.trim() }),
    ...(input.senderAddress !== undefined && { senderAddress: input.senderAddress.trim() }),
    ...(input.senderCity !== undefined && { senderCity: input.senderCity.trim() }),
    ...(input.senderState !== undefined && { senderState: input.senderState.trim() }),
    ...(input.senderPincode !== undefined && { senderPincode: input.senderPincode.trim() }),

    ...(input.receiverName !== undefined && { receiverName: input.receiverName.trim() }),
    ...(input.receiverPhone !== undefined && { receiverPhone: input.receiverPhone.trim() }),
    ...(input.receiverAddress !== undefined && { receiverAddress: input.receiverAddress.trim() }),
    ...(input.receiverCity !== undefined && { receiverCity: input.receiverCity.trim() }),
    ...(input.receiverState !== undefined && { receiverState: input.receiverState.trim() }),
    ...(input.receiverPincode !== undefined && { receiverPincode: input.receiverPincode.trim() }),

    ...(input.itemDescription !== undefined && { itemDescription: input.itemDescription.trim() }),
    ...(input.packageWeight !== undefined && { packageWeight: input.packageWeight }),
    ...(input.lengthCm !== undefined && { lengthCm: input.lengthCm }),
    ...(input.widthCm !== undefined && { widthCm: input.widthCm }),
    ...(input.heightCm !== undefined && { heightCm: input.heightCm }),
    volumetricWeight,
    chargeableWeight,

    ...(input.totalAmount !== undefined && { totalAmount: input.totalAmount }),
    ...(input.declaredValue !== undefined && { declaredValue: input.declaredValue }),
    ...(input.deliveryNotes !== undefined && { deliveryNotes: input.deliveryNotes }),
    ...(input.ndrReason !== undefined && { ndrReason: input.ndrReason }),
  };

  if (statusChanged && input.status) {
    const title = getDefaultMilestoneTitle(input.status);
    let desc = input.deliveryNotes || input.ndrReason || getDefaultMilestoneDescription(input.status, existing.awbNumber);
    if (input.status === OrderStatus.DELIVERED && input.deliveryNotes) {
      desc = `Delivered. Notes: ${input.deliveryNotes}`;
    } else if ((input.status === OrderStatus.CANCELLED || input.status === OrderStatus.RTO) && input.ndrReason) {
      desc = `Exception Reason: ${input.ndrReason}`;
    }

    data.milestones = {
      create: {
        status: input.status,
        title,
        description: desc,
        location: input.statusLocation?.trim() || `${existing.receiverCity} Distribution Hub`,
        performedBy: actorName || "Operations Dispatcher",
      },
    };
  }

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
    },
  });

  await logAudit({
    action: "ORDER_UPDATE",
    module: AppModule.ORDERS,
    entityId: id,
    userId: actorId,
    oldValues: { status: existing.status, chargeableWeight: existing.chargeableWeight },
    newValues: { status: updated.status, chargeableWeight: updated.chargeableWeight },
  });

  return updated;
}

export async function deleteOrder(id: string, actorId: string) {
  const existing = await prisma.order.findUniqueOrThrow({ where: { id } });

  await prisma.order.delete({ where: { id } });

  await logAudit({
    action: "ORDER_DELETE",
    module: AppModule.ORDERS,
    entityId: id,
    userId: actorId,
    oldValues: {
      orderNumber: existing.orderNumber,
      awbNumber: existing.awbNumber,
      status: existing.status,
    },
  });
}

/**
 * Bulk creates multiple consignments from CSV bulk import
 */
export async function bulkCreateOrders(
  rows: CreateOrderInput[],
  actorId: string,
  actorName?: string,
) {
  const createdOrders: any[] = [];

  for (const input of rows) {
    const { volumetricWeight, chargeableWeight } = computeWeights(
      input.packageWeight,
      input.lengthCm,
      input.widthCm,
      input.heightCm,
    );

    const orderNumber = generateOrderNumber();
    const awbNumber = generateAwbNumber();
    const initialStatus = input.status ?? OrderStatus.CONFIRMED;

    const ord = await prisma.order.create({
      data: {
        orderNumber,
        awbNumber,
        status: initialStatus,
        paymentMode: input.paymentMode,
        serviceType: input.serviceType,

        senderName: input.senderName.trim(),
        senderPhone: input.senderPhone.trim(),
        senderAddress: input.senderAddress.trim(),
        senderCity: input.senderCity.trim(),
        senderState: input.senderState.trim(),
        senderPincode: input.senderPincode.trim(),

        receiverName: input.receiverName.trim(),
        receiverPhone: input.receiverPhone.trim(),
        receiverAddress: input.receiverAddress.trim(),
        receiverCity: input.receiverCity.trim(),
        receiverState: input.receiverState.trim(),
        receiverPincode: input.receiverPincode.trim(),

        itemDescription: input.itemDescription.trim(),
        packageWeight: input.packageWeight,
        lengthCm: input.lengthCm,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        volumetricWeight,
        chargeableWeight,

        totalAmount: input.totalAmount,
        declaredValue: input.declaredValue,
        createdById: actorId,

        milestones: {
          create: {
            status: initialStatus,
            title: getDefaultMilestoneTitle(initialStatus),
            description: `Bulk registered consignment with AWB ${awbNumber}. Ready for dispatch.`,
            location: `${input.senderCity.trim()} Origin Hub`,
            performedBy: actorName || "Bulk Dispatch Import",
          },
        },
      },
    });

    createdOrders.push(ord);
  }

  await logAudit({
    action: "ORDER_BULK_IMPORT",
    module: AppModule.ORDERS,
    userId: actorId,
    newValues: { importedCount: createdOrders.length },
  });

  return createdOrders;
}

/**
 * Bulk updates the status of multiple consignments in a single operation
 */
export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: OrderStatus,
  options: { notes?: string; location?: string; actorId: string; actorName?: string },
) {
  const title = getDefaultMilestoneTitle(status);

  const updatedOrders = await prisma.$transaction(async (tx) => {
    const list = await tx.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, orderNumber: true, awbNumber: true, receiverCity: true },
    });

    for (const ord of list) {
      await tx.order.update({
        where: { id: ord.id },
        data: {
          status,
          ...(options.notes && { deliveryNotes: options.notes }),
          milestones: {
            create: {
              status,
              title,
              description: options.notes || getDefaultMilestoneDescription(status, ord.awbNumber),
              location: options.location || `${ord.receiverCity} Hub`,
              performedBy: options.actorName || "Batch Dispatch Action",
            },
          },
        },
      });
    }

    return list.length;
  });

  await logAudit({
    action: "ORDER_BULK_STATUS_UPDATE",
    module: AppModule.ORDERS,
    userId: options.actorId,
    newValues: { orderCount: updatedOrders, targetStatus: status },
  });

  return { updatedCount: updatedOrders };
}

/**
 * Returns all matching orders for CSV manifest generation
 */
export async function getOrdersForExport(params: { search?: string; status?: OrderStatus } = {}) {
  const where: Prisma.OrderWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { awbNumber: { contains: q, mode: "insensitive" } },
      { senderName: { contains: q, mode: "insensitive" } },
      { receiverName: { contains: q, mode: "insensitive" } },
      { receiverPhone: { contains: q, mode: "insensitive" } },
      { receiverCity: { contains: q, mode: "insensitive" } },
      { receiverPincode: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      awbNumber: true,
      status: true,
      paymentMode: true,
      serviceType: true,
      senderName: true,
      senderCity: true,
      senderState: true,
      senderPincode: true,
      receiverName: true,
      receiverPhone: true,
      receiverAddress: true,
      receiverCity: true,
      receiverState: true,
      receiverPincode: true,
      itemDescription: true,
      packageWeight: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
      volumetricWeight: true,
      chargeableWeight: true,
      totalAmount: true,
      declaredValue: true,
      createdAt: true,
    },
  });
}
