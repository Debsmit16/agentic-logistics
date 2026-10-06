"use client";

import { useEffect, useState } from "react";

export default function FinanceClient() {
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
      <h1 className="text-2xl font-bold">COD & Finance</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Open expected</p>
          <p className="text-2xl font-bold">₹{summary.expectedOpen}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold">₹{summary.collectedTotal}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Unsettled</p>
          <p className="text-2xl font-bold">₹{summary.unsettledCollected}</p>
        </div>
      </div>
      {msg ? <p>{msg}</p> : null}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Settle collections</h2>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Settlement reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
        <div className="max-h-48 overflow-auto space-y-1 text-sm">
          {ledger
            .filter((t) => t.type === "COLLECTED" && !t.settlementId)
            .map((t) => (
              <label key={t.id} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(t.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, t.id]
                        : selected.filter((x) => x !== t.id),
                    )
                  }
                />
                {t.parcel.internalId} · ₹{t.amount}
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
              body: JSON.stringify({ reference, transactionIds: selected }),
            });
            const data = await res.json();
            setMsg(res.ok ? "Settlement recorded" : data.error);
            if (res.ok) {
              setSelected([]);
              load();
            }
          }}
        >
          Record settlement
        </button>
      </div>
    </div>
  );
}
