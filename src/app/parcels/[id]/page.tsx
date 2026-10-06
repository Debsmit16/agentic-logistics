import Link from "next/link";
import { requirePageUser, withAppShell } from "@/lib/auth/page-auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export default async function ParcelDetailPage({ params }: Params) {
  await requirePageUser();
  const { id } = await params;
  const parcel = await prisma.parcel.findUnique({
    where: { id },
    include: {
      partner: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!parcel) notFound();

  return withAppShell(
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{parcel.internalId}</h1>
        <Link
          href={`/parcels/${id}/label`}
          className="rounded-lg border px-3 py-2 text-sm text-teal-700"
        >
          Print label
        </Link>
      </div>
      <p className="text-gray-600">
        {parcel.partner.name} · {parcel.partnerAwb} · {parcel.status}
      </p>
      <ul className="mt-6 space-y-2">
        {parcel.events.map((ev) => (
          <li key={ev.id} className="rounded-lg border bg-white p-3 text-sm">
            <p className="text-gray-500">{ev.createdAt.toLocaleString()}</p>
            <p>{ev.message ?? ev.eventType}</p>
          </li>
        ))}
      </ul>
    </>,
  );
}
