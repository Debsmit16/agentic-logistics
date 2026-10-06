"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

export default function FinanceClient() {
  const t = useT();
  const [ledger, setLedger] = useState<
    {
      id: string;
      type: string;
      amount: string;
      settlementId: string | null;
      parcel: { internalId: string };
    }[]
  >([]);
  const [summary, setSummary] = useState({
    expectedOpen: 0,
    collectedTotal: 0,
    unsettledCollected: 0,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const data = await fetch("/api/finance/cod").then((r) => r.json());
    setLedger(data.ledger ?? []);
    setSummary(data.summary ?? summary);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("financeTitle")}</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">{t("openExpected")}</p>
          <p className="text-2xl font-bold">₹{summary.expectedOpen}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">{t("collected")}</p>
          <p className="text-2xl font-bold">₹{summary.collectedTotal}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">{t("unsettled")}</p>
          <p className="text-2xl font-bold">₹{summary.unsettledCollected}</p>
        </div>
      </div>
      {msg ? <p>{msg}</p> : null}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">{t("settleCollections")}</h2>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder={t("settlementReference")}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
        <div className="max-h-48 overflow-auto space-y-1 text-sm">
          {ledger
            .filter((tx) => tx.type === "COLLECTED" && !tx.settlementId)
            .map((tx) => (
              <label key={tx.id} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(tx.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, tx.id]
                        : selected.filter((x) => x !== tx.id),
                    )
                  }
                />
                {tx.parcel.internalId} · ₹{tx.amount}
              </label>
            ))}
        </div>
        <button
          type="button"
          className="rounded bg-teal-700 px-4 py-2 text-white"
          onClick={async () => {
            const res = await fetch("/api/finance/cod", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactionIds: selected, reference }),
            });
            const data = await res.json();
            setMsg(res.ok ? t("saved") : data.error ?? t("error"));
            if (res.ok) {
              setSelected([]);
              load();
            }
          }}
        >
          {t("settleSelected")}
        </button>
      </div>
    </div>
  );
}
