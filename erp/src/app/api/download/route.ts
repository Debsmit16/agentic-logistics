import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Efficiently route to the static setup installer in /public/downloads
  return NextResponse.redirect(
    new URL("/downloads/Agentic-Logistics-Setup.exe", request.url),
    { status: 307 }
  );
}
