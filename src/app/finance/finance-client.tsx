"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { IndianRupee, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";

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
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title={t("financeTitle")}
        description="Cash-on-Delivery (COD) ledger, driver collections, and bank remittance reconciliation."
      />

      {/* KPI Metric Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="skeuo-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t("openExpected")}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-500">₹{summary.expectedOpen.toLocaleString("en-IN")}</p>
        </div>

        <div className="skeuo-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t("collected")}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-500">₹{summary.collectedTotal.toLocaleString("en-IN")}</p>
        </div>

        <div className="skeuo-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t("unsettled")}
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--accent-primary)]">₹{summary.unsettledCollected.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {msg ? (
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm font-bold shadow-xs">
          {msg}
        </div>
      ) : null}

      {/* Settle Collections Module */}
      <div className="skeuo-card p-6 space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)]">{t("settleCollections")}</h2>
        <input
          className="skeuo-input w-full"
          placeholder={t("settlementReference")}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
        <div className="max-h-56 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] shadow-inner text-sm">
          {ledger.filter((tx) => tx.type === "COLLECTED" && !tx.settlementId).length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-4 text-center">No unsettled COD receipts pending.</p>
          ) : (
            ledger
              .filter((tx) => tx.type === "COLLECTED" && !tx.settlementId)
              .map((tx) => (
                <label key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
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
                      className="rounded border-[var(--border-subtle)] text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-mono font-bold text-xs text-[var(--text-primary)]">{tx.parcel.internalId}</span>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-500">₹{tx.amount}</span>
                </label>
              ))
          )}
        </div>

        <button
          type="button"
          disabled={selected.length === 0}
          className="skeuo-btn skeuo-btn-primary px-6 py-3 text-sm font-bold gap-2 disabled:opacity-50"
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
          <span>{t("settleSelected")} ({selected.length})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
