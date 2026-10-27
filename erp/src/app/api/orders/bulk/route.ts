import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule, OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { bulkCreateOrders } from "@/lib/orders/order-service";

const bulkOrderRowSchema = z.object({
  senderName: z.string().min(1, "Sender name required").max(120),
  senderPhone: z.string().min(8, "Valid phone required").max(20),
  senderAddress: z.string().min(3, "Address required").max(250),
  senderCity: z.string().min(1, "City required").max(100),
  senderState: z.string().min(1, "State required").max(100),
  senderPincode: z.string().min(4, "Pincode required").max(12),

  receiverName: z.string().min(1, "Receiver name required").max(120),
  receiverPhone: z.string().min(8, "Valid phone required").max(20),
  receiverAddress: z.string().min(3, "Address required").max(250),
  receiverCity: z.string().min(1, "City required").max(100),
  receiverState: z.string().min(1, "State required").max(100),
  receiverPincode: z.string().min(4, "Pincode required").max(12),

  itemDescription: z.string().min(1, "Item description required").max(250),
  packageWeight: z.coerce.number().positive("Weight must be > 0"),
  lengthCm: z.coerce.number().positive("Length must be > 0").default(15),
  widthCm: z.coerce.number().positive("Width must be > 0").default(10),
  heightCm: z.coerce.number().positive("Height must be > 0").default(10),

  paymentMode: z.nativeEnum(PaymentMode).default(PaymentMode.PREPAID),
  serviceType: z.nativeEnum(ServiceType).default(ServiceType.STANDARD),
  totalAmount: z.coerce.number().min(0).default(0),
  declaredValue: z.coerce.number().min(0).default(0),
  status: z.nativeEnum(OrderStatus).optional(),
  thirdPartyName: z.string().max(100).optional(),
  thirdPartyTracking: z.string().max(100).optional(),
});

const bulkImportSchema = z.object({
  orders: z.array(bulkOrderRowSchema).min(1, "At least 1 order row required").max(200, "Max 200 orders per bulk upload"),
});

export async function POST(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.ORDERS, "canCreate");
    const json = await req.json();
    const parsed = bulkImportSchema.parse(json);

    const created = await bulkCreateOrders(parsed.orders, actor.id, actor.displayName);

    return NextResponse.json({
      success: true,
      importedCount: created.length,
      orders: created,
    }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
