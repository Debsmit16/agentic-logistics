import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import {
  getTripsForSettlement,
  reconcileDriverCash,
  getMerchantRemittanceList,
} from "@/lib/finance/settlement-service";

export async function GET() {
  try {
    await requireApiPermission(AppModule.ORDERS, "canRead");
    const [trips, remittances] = await Promise.all([
      getTripsForSettlement(),
      getMerchantRemittanceList(),
    ]);

    return NextResponse.json({
      trips,
      remittances,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiPermission(AppModule.ORDERS, "canUpdate");
    const body = await req.json().catch(() => ({}));
    const { tripId, cashReceived, denominations, notes } = body;

    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    if (typeof cashReceived !== "number" || cashReceived < 0) {
      return NextResponse.json({ error: "Valid cash amount is required" }, { status: 400 });
    }

    const result = await reconcileDriverCash({
      tripId,
      cashReceived,
      denominations,
      notes,
      userId: user.id,
      userDisplayName: user.displayName,
    });

    return NextResponse.json({ result });
  } catch (e) {
    return jsonError(e);
  }
}

