import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRiderSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { phone, driverName } = await req.json();

    if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
      return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
    }

    const cleanPhone = phone.trim();

    // Check if there is an active dispatch trip for this driver phone
    const activeTrip = await prisma.dispatchTrip.findFirst({
      where: {
        driverPhone: { contains: cleanPhone },
        status: { in: ["DISPATCHED", "DRAFT"] },
      },
      orderBy: { createdAt: "desc" },
    });

    const resolvedName = driverName?.trim() || activeTrip?.driverName || "Courier Associate";
    const resolvedVehicle = activeTrip?.vehicleNumber;

    await createRiderSession({
      driverPhone: cleanPhone,
      driverName: resolvedName,
      vehicleNumber: resolvedVehicle,
    });

    return NextResponse.json({
      ok: true,
      driverName: resolvedName,
      driverPhone: cleanPhone,
      vehicleNumber: resolvedVehicle,
      activeTripId: activeTrip?.id,
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Authentication failed. Please retry." }, { status: 500 });
  }
}

