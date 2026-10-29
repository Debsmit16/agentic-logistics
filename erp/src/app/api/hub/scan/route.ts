import { NextResponse } from "next/server";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { processHubScan, ScannerMode } from "@/lib/scanner/scanner-service";

export async function POST(req: Request) {
  try {
    const user = await requireApiPermission(AppModule.ORDERS, "canRead");
    const body = await req.json().catch(() => ({}));
    const { barcode, mode, hubName, dispatchTripId, targetDestination } = body;

    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
    }

    const validModes: ScannerMode[] = ["INWARD", "STAGE_DISPATCH", "LOOKUP", "VERIFY_DESTINATION"];
    const activeMode: ScannerMode = validModes.includes(mode) ? mode : "LOOKUP";

    const result = await processHubScan({
      barcode,
      mode: activeMode,
      hubName: hubName || "Central Sorting Facility",
      dispatchTripId,
      targetDestination,
      userId: user.id,
      userDisplayName: user.displayName,
    });

    return NextResponse.json({ result });
  } catch (e) {
    return jsonError(e);
  }
}

