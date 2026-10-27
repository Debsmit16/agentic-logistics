import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const attachment = await prisma.orderAttachment.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        fileName: true,
        sizeBytes: true,
      },
    });

    if (!attachment || !attachment.data) {
      return new Response("Attachment not found", { status: 404 });
    }

    return new Response(attachment.data, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType || "image/webp",
        "Content-Length": String(attachment.data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${attachment.fileName}"`,
      },
    });
  } catch (err) {
    console.error("Error serving attachment:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
