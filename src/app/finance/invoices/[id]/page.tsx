import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth/page-auth";
import { getTaxInvoice } from "@/lib/finance/gst-invoice-service";
import { PrintLabelButton } from "@/app/parcels/[id]/label/print-button";

type Params = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Params) {
  await requirePageUser();
  const { id } = await params;
  const invoice = await getTaxInvoice(id);
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-2xl bg-white p-6 text-black print:p-4">
      <style>{`@media print { .no-print { display: none; } }`}</style>
      <div className="no-print mb-4 flex gap-2">
        <Link href="/finance/invoices" className="text-sm text-teal-700 underline">
          ← Invoices
        </Link>
        <PrintLabelButton />
      </div>
      <header className="border-b pb-4">
        <p className="text-xs uppercase text-gray-600">Tax Invoice</p>
        <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
        <p className="text-sm">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
      </header>
      <section className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <p className="font-semibold">Seller</p>
          <p>{invoice.sellerLegalName}</p>
          <p>GSTIN: {invoice.sellerGstin}</p>
          <p>{invoice.sellerAddress}</p>
        </div>
        <div>
          <p className="font-semibold">Buyer</p>
          <p>{invoice.buyerName}</p>
          {invoice.buyerGstin ? <p>GSTIN: {invoice.buyerGstin}</p> : null}
          <p>{invoice.buyerAddress}</p>
          <p>Place of supply: {invoice.placeOfSupply}</p>
        </div>
      </section>
      <table className="mt-6 w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Description</th>
            <th className="p-2">HSN/SAC</th>
            <th className="p-2 text-right">Taxable</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2">Courier / cargo handling services</td>
            <td className="p-2 text-center">{invoice.hsnSac}</td>
            <td className="p-2 text-right">₹{invoice.taxableAmount.toString()}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 space-y-1 text-sm text-right">
        {Number(invoice.cgstAmount) > 0 ? (
          <p>
            CGST @ {invoice.cgstRate.toString()}%: ₹{invoice.cgstAmount.toString()}
          </p>
        ) : null}
        {Number(invoice.sgstAmount) > 0 ? (
          <p>
            SGST @ {invoice.sgstRate.toString()}%: ₹{invoice.sgstAmount.toString()}
          </p>
        ) : null}
        {Number(invoice.igstAmount) > 0 ? (
          <p>
            IGST @ {invoice.igstRate.toString()}%: ₹{invoice.igstAmount.toString()}
          </p>
        ) : null}
        <p className="text-lg font-bold">Total: ₹{invoice.totalAmount.toString()}</p>
      </div>
      {invoice.parcel ? (
        <p className="mt-4 text-xs text-gray-600">Parcel: {invoice.parcel.internalId}</p>
      ) : null}
    </div>
  );
}
