"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

type Invoice = {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  totalAmount: string;
  buyerName: string;
  parcel: { internalId: string } | null;
};

export default function InvoicesClient() {
  const t = useT();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [parcelId, setParcelId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const data = await fetch("/api/finance/invoices").then((r) => r.json());
    setInvoices(data.invoices ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("invoicesTitle")}</h1>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <div className="flex flex-wrap gap-2 rounded-xl border bg-white p-4">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Parcel UUID (from parcel detail URL)"
          value={parcelId}
          onChange={(e) => setParcelId(e.target.value)}
        />
        <button
          type="button"
          className="rounded bg-teal-700 px-4 py-2 text-white text-sm"
          onClick={async () => {
            const res = await fetch("/api/finance/invoices", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ parcelId }),
            });
            const data = await res.json();
            setMsg(res.ok ? `${t("generateInvoice")}: ${data.invoice?.invoiceNumber}` : data.error);
            if (res.ok) load();
          }}
        >
          {t("generateInvoice")}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="p-3">{t("invoiceNumber")}</th>
              <th className="p-3">{t("invoiceDate")}</th>
              <th className="p-3">{t("buyer")}</th>
              <th className="p-3">{t("invoiceTotal")}</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-3 font-medium">{inv.invoiceNumber}</td>
                <td className="p-3">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                <td className="p-3">{inv.buyerName}</td>
                <td className="p-3">₹{inv.totalAmount}</td>
                <td className="p-3">
                  <Link href={`/finance/invoices/${inv.id}`} className="text-teal-700 underline">
                    {t("print")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
