import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule, OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { flagsForModule } from "@/lib/permissions/user-module";
import { jsonError } from "@/lib/api/helpers";
import { createOrder, listOrders } from "@/lib/orders/order-service";

const createOrderSchema = z.object({
  senderName: z.string().min(1, "Sender name is required").max(120),
  senderPhone: z.string().min(8, "Valid phone required").max(20),
  senderAddress: z.string().min(3, "Address is required").max(250),
  senderCity: z.string().min(1, "City is required").max(100),
  senderState: z.string().min(1, "State is required").max(100),
  senderPincode: z.string().min(4, "Pincode is required").max(12),

  receiverName: z.string().min(1, "Receiver name is required").max(120),
  receiverPhone: z.string().min(8, "Valid phone required").max(20),
  receiverAddress: z.string().min(3, "Address is required").max(250),
  receiverCity: z.string().min(1, "City is required").max(100),
  receiverState: z.string().min(1, "State is required").max(100),
  receiverPincode: z.string().min(4, "Pincode is required").max(12),

  itemDescription: z.string().min(1, "Item description required").max(250),
  packageWeight: z.coerce.number().positive("Weight must be > 0"),
  lengthCm: z.coerce.number().positive("Length must be > 0"),
  widthCm: z.coerce.number().positive("Width must be > 0"),
  heightCm: z.coerce.number().positive("Height must be > 0"),

  paymentMode: z.nativeEnum(PaymentMode),
  serviceType: z.nativeEnum(ServiceType),
  totalAmount: z.coerce.number().min(0, "Amount cannot be negative"),
  declaredValue: z.coerce.number().min(0, "Declared value cannot be negative"),
  status: z.nativeEnum(OrderStatus).optional(),
  parcelPhotoBase64: z.string().optional(),
  parcelPhotoName: z.string().optional(),
  thirdPartyName: z.string().max(100).optional(),
  thirdPartyTracking: z.string().max(100).optional(),
});

export async function GET(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.ORDERS, "canRead");
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(Math.max(1, Number(url.searchParams.get("limit") ?? 20)), 100);
    const search = url.searchParams.get("search") ?? undefined;
    const statusParam = url.searchParams.get("status");
    const status =
      statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;

    const [data, permissions] = await Promise.all([
      listOrders({ page, limit, search, status }),
      flagsForModule(actor.role?.name, AppModule.ORDERS),
    ]);

    return NextResponse.json({
      ...data,
      permissions,
      currentUserId: actor.id,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.ORDERS, "canCreate");
    const json = await req.json();
    const parsed = createOrderSchema.parse(json);
    const order = await createOrder(parsed, actor.id, actor.displayName);
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
