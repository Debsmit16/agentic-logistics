import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordReset, resetPassword } from "@/lib/config/system-config";
import { handleApiError } from "@/lib/api/route-helpers";

export async function POST(request: Request) {
  try {
    const { identifier } = z.object({ identifier: z.string() }).parse(await request.json());
    const result = await createPasswordReset(identifier);
    const showDev =
      process.env.SMS_DEV_MODE === "true" || process.env.NODE_ENV === "development";
    return NextResponse.json({
      ok: true,
      message: "If an account exists, reset instructions were sent.",
      devResetUrl: showDev ? result.devResetUrl : undefined,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: Request) {
  try {
    const body = z
      .object({ token: z.string(), password: z.string().min(6) })
      .parse(await request.json());
    await resetPassword(body.token, body.password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
