import { NextResponse } from "next/server";
import { z } from "zod";
import { AppModule } from "@prisma/client";
import { requireApiPermission } from "@/lib/permissions";
import { jsonError } from "@/lib/api/helpers";
import { getGeneralSettings, updateGeneralSettings } from "@/lib/settings/system-settings";
import { logAudit } from "@/lib/audit/log-audit";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const actor = await requireApiPermission(AppModule.SETTINGS, "canRead");
    const settings = await getGeneralSettings();
    const canUpdate = await hasPermission(actor.role?.name, AppModule.SETTINGS, "canUpdate");
    return NextResponse.json({ settings, canUpdate });
  } catch (e) {
    return jsonError(e);
  }
}

const patchSchema = z.object({
  appName: z.string().min(2).max(120).optional(),
  supportEmail: z.string().email().optional(),
  timezone: z.string().min(2).max(64).optional(),
});

export async function PATCH(req: Request) {
  try {
    const actor = await requireApiPermission(AppModule.SETTINGS, "canUpdate");
    const body = patchSchema.parse(await req.json());
    const settings = await updateGeneralSettings(body);
    await logAudit({
      action: "SETTINGS_UPDATE",
      module: AppModule.SETTINGS,
      userId: actor.id,
      newValues: settings,
    });
    return NextResponse.json({ settings });
  } catch (e) {
    return jsonError(e);
  }
}
