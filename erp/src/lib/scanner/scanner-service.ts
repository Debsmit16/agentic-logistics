import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export type ScannerMode = "INWARD" | "STAGE_DISPATCH" | "LOOKUP" | "VERIFY_DESTINATION";

export interface ScanResult {
  success: boolean;
  action: ScannerMode;
  message: string;
  order: {
    id: string;
    awbNumber: string;
    orderNumber: string;
    status: OrderStatus;
    senderName: string;
    senderCity: string;
    senderPincode: string;
    receiverName: string;
    receiverCity: string;
    receiverState: string;
    receiverPincode: string;
    receiverPhone: string;
    paymentMode: string;
    totalAmount: number;
    packageWeight: number;
    itemDescription: string;
    dispatchTripId?: string | null;
    dispatchTripNumber?: string | null;
  } | null;
  timestamp: string;
}

export async function processHubScan({
  barcode,
  mode,
  hubName = "Central Sorting Facility",
  dispatchTripId,
  targetDestination,
  userId,
  userDisplayName = "Hub Scanner Operator",
}: {
  barcode: string;
  mode: ScannerMode;
  hubName?: string;
  dispatchTripId?: string;
  targetDestination?: string;
  userId?: string;
  userDisplayName?: string;
}): Promise<ScanResult> {
  const cleanBarcode = barcode.replace(/^\*+|\*+$/g, "").trim().toUpperCase();

  if (!cleanBarcode) {
    return {
      success: false,
      action: mode,
      message: "No barcode data received",
      order: null,
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Locate Order by AWB or Order Number
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ awbNumber: cleanBarcode }, { orderNumber: cleanBarcode }],
    },
    include: {
      dispatchTrip: {
        select: {
          id: true,
          tripNumber: true,
          status: true,
        },
      },
    },
  });

  if (!order) {
    return {
      success: false,
      action: mode,
      message: `No consignment found matching '${cleanBarcode}'`,
      order: null,
      timestamp: new Date().toISOString(),
    };
  }

  const orderProjection = {
    id: order.id,
    awbNumber: order.awbNumber,
    orderNumber: order.orderNumber,
    status: order.status,
    senderName: order.senderName,
    senderCity: order.senderCity,
    senderPincode: order.senderPincode,
    receiverName: order.receiverName,
    receiverCity: order.receiverCity,
    receiverState: order.receiverState,
    receiverPincode: order.receiverPincode,
    receiverPhone: order.receiverPhone,
    paymentMode: order.paymentMode,
    totalAmount: order.totalAmount,
    packageWeight: order.packageWeight,
    itemDescription: order.itemDescription,
    dispatchTripId: order.dispatchTripId,
    dispatchTripNumber: order.dispatchTrip?.tripNumber || null,
  };

  // 2. Mode-Specific Execution
  switch (mode) {
    case "INWARD": {
      // Inwarding Scan: transitions to IN_TRANSIT at this hub
      if (order.status === OrderStatus.DELIVERED) {
        return {
          success: false,
          action: mode,
          message: `Consignment is already DELIVERED (e-POD recorded). Cannot re-inward.`,
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      }

      const updated = await prisma.$transaction(async (tx) => {
        const o = await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.IN_TRANSIT,
          },
        });

        await tx.orderMilestone.create({
          data: {
            orderId: order.id,
            status: OrderStatus.IN_TRANSIT,
            title: `Inwarded at ${hubName}`,
            description: `Consignment scanned at ingress dock. Physical weight verified: ${order.packageWeight} kg. Staged for routing.`,
            location: hubName,
            performedBy: userDisplayName,
          },
        });

        return o;
      });

      return {
        success: true,
        action: mode,
        message: `Successfully Inwarded at ${hubName}`,
        order: {
          ...orderProjection,
          status: updated.status,
        },
        timestamp: new Date().toISOString(),
      };
    }

    case "STAGE_DISPATCH": {
      if (!dispatchTripId) {
        return {
          success: false,
          action: mode,
          message: "No dispatch trip selected to stage this consignment",
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      }

      const trip = await prisma.dispatchTrip.findUnique({
        where: { id: dispatchTripId },
      });

      if (!trip) {
        return {
          success: false,
          action: mode,
          message: "Selected dispatch trip not found",
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      }

      if (order.status === OrderStatus.DELIVERED) {
        return {
          success: false,
          action: mode,
          message: "Consignment is already marked DELIVERED",
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            dispatchTripId: trip.id,
          },
        });

        await tx.orderMilestone.create({
          data: {
            orderId: order.id,
            status: OrderStatus.CONFIRMED,
            title: `Staged to Runsheet ${trip.tripNumber}`,
            description: `Assigned to vehicle ${trip.vehicleNumber} driven by ${trip.driverName} via barcode scan.`,
            location: hubName,
            performedBy: userDisplayName,
          },
        });
      });

      return {
        success: true,
        action: mode,
        message: `Assigned to Trip ${trip.tripNumber} (${trip.vehicleNumber})`,
        order: {
          ...orderProjection,
          dispatchTripId: trip.id,
          dispatchTripNumber: trip.tripNumber,
        },
        timestamp: new Date().toISOString(),
      };
    }

    case "VERIFY_DESTINATION": {
      if (!targetDestination) {
        return {
          success: false,
          action: mode,
          message: "No target destination or pincode specified for route verification",
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      }

      const cleanTarget = targetDestination.trim().toLowerCase();
      const matchCity = order.receiverCity.toLowerCase().includes(cleanTarget);
      const matchPincode = order.receiverPincode.includes(cleanTarget);
      const matchState = order.receiverState.toLowerCase().includes(cleanTarget);

      if (matchCity || matchPincode || matchState) {
        return {
          success: true,
          action: mode,
          message: `ROUTE MATCH: Destined for ${order.receiverCity} (${order.receiverPincode})`,
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          action: mode,
          message: `MISMATCH: Destined for ${order.receiverCity} (${order.receiverPincode}), not ${targetDestination}`,
          order: orderProjection,
          timestamp: new Date().toISOString(),
        };
      }
    }

    case "LOOKUP":
    default: {
      return {
        success: true,
        action: mode,
        message: `Consignment located · Status: ${order.status}`,
        order: orderProjection,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

