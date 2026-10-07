"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Package,
  Search,
  Plus,
  ExternalLink,
  Printer,
  X,
  CreditCard,
  Banknote,
  MapPin,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

type Parcel = {
  id: string;
  internalId: string;
  partnerAwb: string;
  status: string;
  paymentType: string;
  codAmount: number | string;
  receiverName: string;
  receiverPhone: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  partner: {
    code: string;
    name: string;
  };
};

const STATUS_TABS = [
  { id: "", label: "All Parcels" },
  { id: "EXPECTED", label: "Expected" },
  { id: "RECEIVED", label: "Received" },
  { id: "STORED", label: "In Hub" },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "DELIVERY_FAILED", label: "Exceptions" },
];

export default function ParcelsClient() {
  const t = useT();
  const [items, setItems] = useState<Parcel[]>([]);
  const [total, setTotal] = useState(0);
  const [partners, setPartners] = useState<{ id: string; name: string; code: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    partnerId: "",
    partnerAwb: "",
    receiverName: "",
    receiverPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    paymentType: "PREPAID",
    codAmount: "0",
    warehouseId: "",
  });

  async function loadData(searchQuery = q, status = statusFilter) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (status) params.set("status", status);

      const [pRes, partRes, whRes] = await Promise.all([
        fetch(`/api/parcels?${params.toString()}`).then((r) => r.json()),
        fetch("/api/partners").then((r) => r.json()),
        fetch("/api/warehouses").then((r) => r.json()),
      ]);

      setItems(pRes.items ?? []);
      setTotal(pRes.total ?? (pRes.items ? pRes.items.length : 0));
      setPartners(partRes.partners ?? []);
      setWarehouses(whRes.warehouses ?? []);
      if (!form.partnerId && partRes.partners?.length > 0) {
        setForm((f) => ({ ...f, partnerId: partRes.partners[0].id }));
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load parcel records." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(q, statusFilter);
  }, [statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData(q, statusFilter);
  }

  async function createParcel(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          codAmount: Number(form.codAmount),
          warehouseId: form.warehouseId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create shipment");

      setMessage({ type: "success", text: `Parcel ${data.parcel.internalId} created successfully.` });
      setIsModalOpen(false);
      setForm({
        partnerId: partners[0]?.id || "",
        partnerAwb: "",
        receiverName: "",
        receiverPhone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
        paymentType: "PREPAID",
        codAmount: "0",
        warehouseId: "",
      });
      loadData(q, statusFilter);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error creating parcel";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <PageHeader
        title={t("navParcels")}
        description="Real-time freight registry, status verification, and physical warehouse tracking."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData(q, statusFilter)}
              className="skeuo-btn skeuo-btn-secondary p-2.5 rounded-xl shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="skeuo-btn skeuo-btn-primary px-4 py-2.5 text-xs font-bold gap-2 tracking-wide"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Shipment</span>
            </button>
          </div>
        }
      />

      {message ? (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium backdrop-blur-md ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* Tactile Filter Capsule & Search Bar */}
      <div className="skeuo-card p-4 space-y-4">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[var(--bg-surface-muted)] p-1.5 rounded-xl border border-[var(--border-subtle)] shadow-inner">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  active
                    ? "bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by AWB barcode, PAR-000001, customer phone..."
              className="skeuo-input w-full pl-11 pr-4 py-2.5 text-sm font-medium"
            />
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  loadData("", statusFilter);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            className="skeuo-btn skeuo-btn-secondary px-5 py-2.5 text-xs font-bold tracking-wide"
          >
            {t("search")}
          </button>
        </form>
      </div>

      {/* Main Glass Table Container */}
      <div className="skeuo-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] font-medium bg-[var(--bg-surface-muted)]">
          <span>
            Tracking <strong className="text-[var(--text-primary)]">{items.length}</strong> of{" "}
            <strong className="text-[var(--text-primary)]">{total}</strong> active parcels
          </span>
          <span className="flex items-center gap-1.5 text-[var(--accent-primary)]">
            <Sparkles className="w-3.5 h-3.5" />
            Live sync enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3 px-5">Shipment / AWB</th>
                <th className="py-3 px-5">Carrier</th>
                <th className="py-3 px-5">Current Status</th>
                <th className="py-3 px-5">Receiver & City</th>
                <th className="py-3 px-5">Billing</th>
                <th className="py-3 px-5">Recorded</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="h-4 bg-slate-500/20 rounded w-28 mb-1" />
                      <div className="h-3 bg-slate-500/10 rounded w-20" />
                    </td>
                    <td className="py-4 px-5"><div className="h-5 bg-slate-500/20 rounded w-16" /></td>
                    <td className="py-4 px-5"><div className="h-6 bg-slate-500/20 rounded-full w-24" /></td>
                    <td className="py-4 px-5">
                      <div className="h-4 bg-slate-500/20 rounded w-32 mb-1" />
                      <div className="h-3 bg-slate-500/10 rounded w-24" />
                    </td>
                    <td className="py-4 px-5"><div className="h-5 bg-slate-500/20 rounded w-20" /></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-500/20 rounded w-16" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-7 bg-slate-500/20 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 px-5 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3 shadow-inner">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-[var(--text-primary)]">No parcel records found</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                      {q || statusFilter
                        ? "No shipments match your current query or status filters."
                        : "There are no shipments registered yet. Click '+ Ingest Shipment' to record one."}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((p) => {
                  const isCod = p.paymentType === "COD";
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--bg-surface-muted)] transition-colors group"
                    >
                      {/* Tracking / Internal ID */}
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/parcels/${p.id}`}
                          className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] hover:underline transition-colors flex items-center gap-1.5"
                        >
                          <span>{p.internalId}</span>
                        </Link>
                        <p className="text-xs font-mono text-[var(--text-muted)]">{p.partnerAwb}</p>
                      </td>

                      {/* Partner */}
                      <td className="py-3.5 px-5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-2xs">
                          {p.partner?.code || "PARTNER"}
                        </span>
                      </td>

                      {/* Status Jewel Badge */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      {/* Receiver & Destination */}
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                          {p.receiverName}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                          <span>
                            {p.city}
                            {p.pincode ? ` (${p.pincode})` : ""}
                          </span>
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-5">
                        {isCod ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-2xs">
                            <Banknote className="w-3.5 h-3.5" />
                            <span>COD ₹{p.codAmount}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30 shadow-2xs">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Prepaid</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/parcels/${p.id}/label`}
                            className="skeuo-btn skeuo-btn-secondary p-1.5 rounded-lg"
                            title="Print Label"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/parcels/${p.id}`}
                            className="skeuo-btn skeuo-btn-secondary px-2.5 py-1 text-xs gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingest Parcel Modal with Tactile Inset Inputs */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="skeuo-card max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)]">Ingest New Parcel</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Record AWB manifest to initialize parcel state tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-surface-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createParcel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Partner Carrier *
                  </label>
                  <select
                    required
                    value={form.partnerId}
                    onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                    className="skeuo-input w-full px-3 py-2 text-sm"
                  >
                    {partners.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name} ({pt.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Partner AWB *
                  </label>
                  <input
                    required
                    value={form.partnerAwb}
                    onChange={(e) => setForm({ ...form, partnerAwb: e.target.value })}
                    placeholder="e.g. EKART-992200"
                    className="skeuo-input w-full px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Receiver Full Name *
                  </label>
                  <input
                    required
                    value={form.receiverName}
                    onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                    placeholder="Full recipient name"
                    className="skeuo-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    required
                    value={form.receiverPhone}
                    onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="skeuo-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Street Address *
                </label>
                <input
                  required
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="Premises, building, street"
                  className="skeuo-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    City *
                  </label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="skeuo-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    State *
                  </label>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="skeuo-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Pincode *
                  </label>
                  <input
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="skeuo-input w-full px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[var(--border-subtle)]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentType}
                    onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                    className="skeuo-input w-full px-3 py-2 text-sm"
                  >
                    <option value="PREPAID">Prepaid (Electronic Transfer)</option>
                    <option value="COD">Cash On Delivery (COD)</option>
                  </select>
                </div>
                {form.paymentType === "COD" ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      COD Cash Collection (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.codAmount}
                      onChange={(e) => setForm({ ...form, codAmount: e.target.value })}
                      className="skeuo-input w-full px-3 py-2 text-sm font-bold"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="skeuo-btn skeuo-btn-secondary px-4 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="skeuo-btn skeuo-btn-primary px-6 py-2.5 text-xs font-bold"
                >
                  {isSubmitting ? "Ingesting…" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
