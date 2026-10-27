import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule, OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { deleteOrder, getOrderById, updateOrder } from "@/lib/orders/order-service";

const patchOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),

  senderName: z.string().min(1).max(120).optional(),
  senderPhone: z.string().min(8).max(20).optional(),
  senderAddress: z.string().min(3).max(250).optional(),
  senderCity: z.string().min(1).max(100).optional(),
  senderState: z.string().min(1).max(100).optional(),
  senderPincode: z.string().min(4).max(12).optional(),

  receiverName: z.string().min(1).max(120).optional(),
  receiverPhone: z.string().min(8).max(20).optional(),
  receiverAddress: z.string().min(3).max(250).optional(),
  receiverCity: z.string().min(1).max(100).optional(),
  receiverState: z.string().min(1).max(100).optional(),
  receiverPincode: z.string().min(4).max(12).optional(),

  itemDescription: z.string().min(1).max(250).optional(),
  packageWeight: z.coerce.number().positive().optional(),
  lengthCm: z.coerce.number().positive().optional(),
  widthCm: z.coerce.number().positive().optional(),
  heightCm: z.coerce.number().positive().optional(),

  totalAmount: z.coerce.number().min(0).optional(),
  declaredValue: z.coerce.number().min(0).optional(),
  deliveryNotes: z.string().max(300).optional(),
  ndrReason: z.string().max(200).optional(),
  statusLocation: z.string().max(100).optional(),
  stepPhotoBase64: z.string().optional(),
  stepPhotoName: z.string().optional(),
  stepPhotoCaption: z.string().optional(),
  parcelPhotoBase64: z.string().optional(),
  parcelPhotoName: z.string().optional(),
  thirdPartyName: z.string().max(100).optional(),
  thirdPartyTracking: z.string().max(100).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireApiPermission(AppModule.ORDERS, "canRead");
    const { id } = await ctx.params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireApiPermission(AppModule.ORDERS, "canUpdate");
    const { id } = await ctx.params;
    const body = patchOrderSchema.parse(await req.json());
    const order = await updateOrder(id, body, actor.id, actor.displayName);
    return NextResponse.json({ order });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireApiPermission(AppModule.ORDERS, "canDelete");
    const { id } = await ctx.params;
    await deleteOrder(id, actor.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
