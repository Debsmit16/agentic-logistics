import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

function maskName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length > 1 ? `${p[0]}***` : p))
    .join(" ");
}

function maskPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length <= 4) return "****";
  return `******${cleaned.slice(-4)}`;
}

export interface PublicTrackingResponse {
  awbNumber: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  serviceType: string;
  paymentMode: string;
  totalAmount: number;
  packageWeight: number;
  itemDescription: string;
  createdAt: string;

  // Bilateral Routing
  originCity: string;
  originState: string;
  originPincode: string;
  senderMasked: string;

  destinationCity: string;
  destinationState: string;
  destinationPincode: string;
  receiverMasked: string;

  // Stage & Telemetry
  stageIndex: number; // 0 = Registered, 1 = Staged/Transit, 2 = Out for Delivery, 3 = Delivered / NDR
  isDelivered: boolean;
  hasNdr: boolean;
  ndrReason?: string | null;

  // Active Dispatch / Driver (if dispatched)
  courier?: {
    driverName: string;
    vehicleNumber: string;
    tripNumber: string;
    status: string;
  } | null;

  // Milestones Timeline
  milestones: Array<{
    id: string;
    status: string;
    title: string;
    description?: string | null;
    location?: string | null;
    performedBy?: string | null;
    createdAt: string;
  }>;

  // Verified Proof Attachments (if delivered)
  proofAttachments: Array<{
    id: string;
    type: string;
    fileName: string;
    caption?: string | null;
    url: string;
  }>;
}

export function computeStageIndex(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.DRAFT:
    case OrderStatus.CONFIRMED:
      return 0; // Booked
    case OrderStatus.IN_TRANSIT:
    case OrderStatus.HANDED_TO_THIRD_PARTY:
      return 1; // In Transit
    case OrderStatus.OUT_FOR_DELIVERY:
      return 2; // Out for Delivery
    case OrderStatus.DELIVERED:
      return 3; // Delivered
    case OrderStatus.RTO:
    case OrderStatus.CANCELLED:
      return 2; // Exception
    default:
      return 0;
  }
}

export function formatStatusLabel(status: OrderStatus, ndrReason?: string | null): string {
  if (ndrReason && status === OrderStatus.OUT_FOR_DELIVERY) {
    return `Delivery Rescheduled / Exception: ${ndrReason}`;
  }
  switch (status) {
    case OrderStatus.CONFIRMED:
      return "Consignment Registered & Ready for Hub Staging";
    case OrderStatus.IN_TRANSIT:
      return "In Transit Between Sorting Hubs";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Out for Delivery with Courier Rider";
    case OrderStatus.DELIVERED:
      return "Delivered & Verified with Proof of Delivery";
    case OrderStatus.HANDED_TO_THIRD_PARTY:
      return "Handed to 3rd Party Linehaul Partner";
    case OrderStatus.RTO:
      return "Return to Origin in Progress";
    case OrderStatus.CANCELLED:
      return "Shipment Cancelled";
    default:
      return String(status).replace(/_/g, " ");
  }
}

export async function getConsignmentTracking(
  query: string,
  isInternal: boolean = false
) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { awbNumber: { equals: cleanQuery, mode: "insensitive" } },
        { orderNumber: { equals: cleanQuery, mode: "insensitive" } },
      ],
    },
    include: {
      dispatchTrip: {
        select: {
          id: true,
          tripNumber: true,
          vehicleNumber: true,
          driverName: true,
          driverPhone: true,
          originHub: true,
          destinationHub: true,
          status: true,
          createdAt: true,
        },
      },
      milestones: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          status: true,
          title: true,
          description: true,
          location: true,
          performedBy: true,
          createdAt: true,
        },
      },
      attachments: {
        select: {
          id: true,
          type: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          caption: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) return null;

  const stageIndex = computeStageIndex(order.status);
  const isDelivered = order.status === OrderStatus.DELIVERED;
  const hasNdr = Boolean(order.ndrReason);

  const proofAttachments = order.attachments.map((att) => ({
    id: att.id,
    type: att.type,
    fileName: att.fileName,
    caption: att.caption,
    url: `/api/attachments/${att.id}`,
  }));

  // Public Response (Sanitized privacy)
  if (!isInternal) {
    const publicData: PublicTrackingResponse = {
      awbNumber: order.awbNumber,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: formatStatusLabel(order.status, order.ndrReason),
      serviceType: order.serviceType,
      paymentMode: order.paymentMode,
      totalAmount: order.totalAmount,
      packageWeight: order.packageWeight,
      itemDescription: order.itemDescription,
      createdAt: order.createdAt.toISOString(),

      originCity: order.senderCity,
      originState: order.senderState,
      originPincode: order.senderPincode,
      senderMasked: maskName(order.senderName),

      destinationCity: order.receiverCity,
      destinationState: order.receiverState,
      destinationPincode: order.receiverPincode,
      receiverMasked: maskName(order.receiverName),

      stageIndex,
      isDelivered,
      hasNdr,
      ndrReason: order.ndrReason,

      courier: order.dispatchTrip
        ? {
            driverName: order.dispatchTrip.driverName,
            vehicleNumber: order.dispatchTrip.vehicleNumber,
            tripNumber: order.dispatchTrip.tripNumber,
            status: order.dispatchTrip.status,
          }
        : null,

      milestones: order.milestones.map((m) => ({
        id: m.id,
        status: m.status,
        title: m.title,
        description: m.description,
        location: m.location,
        performedBy: m.performedBy ? maskName(m.performedBy) : null,
        createdAt: m.createdAt.toISOString(),
      })),

      proofAttachments,
    };

    return publicData;
  }

  // Internal Full Response (For ERP operators)
  return {
    ...order,
    stageIndex,
    isDelivered,
    hasNdr,
    statusLabel: formatStatusLabel(order.status, order.ndrReason),
    proofAttachments,
  };
}

