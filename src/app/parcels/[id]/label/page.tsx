import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth/page-auth";
import { prisma } from "@/lib/db";
import { PrintLabelButton } from "./print-button";

type Params = { params: Promise<{ id: string }> };

export default async function ParcelLabelPage({ params }: Params) {
  await requirePageUser();
  const { id } = await params;
  const parcel = await prisma.parcel.findUnique({
    where: { id },
    include: { partner: true },
  });
  if (!parcel) notFound();

  return (
    <div className="label-page mx-auto max-w-md bg-white p-6 text-black">
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      `}</style>
      <div className="no-print mb-4 flex gap-2">
        <Link href={`/parcels/${id}`} className="text-sm text-teal-700 underline">
          ← Parcel detail
        </Link>
        <PrintLabelButton />
      </div>
      <div className="border-2 border-dashed border-gray-800 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-600">Agentic Logistics</p>
        <p className="mt-2 text-2xl font-bold">{parcel.internalId}</p>
        <p className="font-mono text-lg">{parcel.barcode ?? parcel.partnerAwb}</p>
        <hr className="my-3 border-gray-400" />
        <p className="text-sm">
          Partner: {parcel.partner.name} · AWB {parcel.partnerAwb}
        </p>
        <p className="mt-2 font-semibold">{parcel.receiverName}</p>
        <p className="text-sm">{parcel.receiverPhone}</p>
        <p className="mt-1 text-sm">
          {parcel.addressLine1}
          {parcel.addressLine2 ? `, ${parcel.addressLine2}` : ""}
        </p>
        <p className="text-sm">
          {parcel.city}, {parcel.state} {parcel.pincode}
        </p>
        <p className="mt-3 text-sm font-medium">
          {parcel.paymentType === "COD" ? `COD ₹${parcel.codAmount}` : "PREPAID"}
        </p>
        {parcel.weightKg ? (
          <p className="text-xs text-gray-600">Weight: {parcel.weightKg.toString()} kg</p>
        ) : null}
      </div>
    </div>
  );
}
