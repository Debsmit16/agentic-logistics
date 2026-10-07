"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Package,
  Search,
  Plus,
  Filter,
  ExternalLink,
  Printer,
  X,
  CreditCard,
  Banknote,
  MapPin,
  RefreshCw,
  Clock,
  ArrowUpDown,
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
  { id: "", label: "All Shipments" },
  { id: "EXPECTED", label: "Expected" },
  { id: "RECEIVED", label: "Received" },
  { id: "STORED", label: "In Warehouse" },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "DELIVERY_FAILED", label: "Failed" },
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
      {/* Header with Title and Create Action */}
      <PageHeader
        title={t("navParcels")}
        description="Comprehensive shipment registry, lifecycle tracking, and manifest management."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadData(q, statusFilter)}
              className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Parcel</span>
            </button>
          </div>
        }
      />

      {message ? (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-cyan-50 text-cyan-800 border border-cyan-200/80 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by AWB, Internal ID (PAR-...), or Customer Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
            />
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  loadData("", statusFilter);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-2xs"
          >
            {t("search")}
          </button>
        </form>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium bg-slate-50/50">
          <span>
            Showing <strong className="text-slate-900">{items.length}</strong> of{" "}
            <strong className="text-slate-900">{total}</strong> shipments
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Live sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Shipment ID / AWB</th>
                <th className="py-3 px-5">Partner</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Receiver & Destination</th>
                <th className="py-3 px-5">Payment</th>
                <th className="py-3 px-5">Created</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="h-4 bg-slate-200 rounded w-28 mb-1" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </td>
                    <td className="py-4 px-5"><div className="h-5 bg-slate-100 rounded w-16" /></td>
                    <td className="py-4 px-5"><div className="h-6 bg-slate-100 rounded-full w-24" /></td>
                    <td className="py-4 px-5">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-1" />
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-5"><div className="h-5 bg-slate-100 rounded w-20" /></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-7 bg-slate-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-5 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="text-base font-semibold text-slate-800">No shipments found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {q || statusFilter
                        ? "Try clearing your search query or switching to another status tab."
                        : "There are no parcels in the system yet. Click '+ Ingest Parcel' to create your first shipment."}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((p) => {
                  const isCod = p.paymentType === "COD";
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Tracking / Internal ID */}
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/parcels/${p.id}`}
                          className="font-bold text-slate-900 group-hover:text-cyan-700 hover:underline transition-colors flex items-center gap-1.5"
                        >
                          <span>{p.internalId}</span>
                        </Link>
                        <p className="text-xs font-mono text-slate-500">{p.partnerAwb}</p>
                      </td>

                      {/* Partner */}
                      <td className="py-3.5 px-5">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.partner?.code || "PARTNER"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      {/* Receiver & Destination */}
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {p.receiverName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {p.city}
                            {p.pincode ? ` (${p.pincode})` : ""}
                          </span>
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-5">
                        {isCod ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Banknote className="w-3.5 h-3.5" />
                            <span>COD ₹{p.codAmount}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Prepaid</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/parcels/${p.id}/label`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Print Label"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/parcels/${p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <span>View</span>
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

      {/* Ingest Parcel Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ingest New Parcel</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create a tracked warehouse shipment from a partner AWB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createParcel} className="space-y-4">
              {/* Partner & AWB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Logistics Partner *
                  </label>
                  <select
                    required
                    value={form.partnerId}
                    onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    {partners.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name} ({pt.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Partner AWB *
                  </label>
                  <input
                    required
                    value={form.partnerAwb}
                    onChange={(e) => setForm({ ...form, partnerAwb: e.target.value })}
                    placeholder="e.g. DLV-99881122"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Receiver Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Customer Name *
                  </label>
                  <input
                    required
                    value={form.receiverName}
                    onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                    placeholder="Receiver full name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Customer Phone *
                  </label>
                  <input
                    required
                    value={form.receiverPhone}
                    onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Delivery Address *
                </label>
                <input
                  required
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="Street address, building, apartment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    City *
                  </label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    State *
                  </label>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Pincode *
                  </label>
                  <input
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* Payment Type & COD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentType}
                    onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="PREPAID">Prepaid (Paid Online)</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>
                {form.paymentType === "COD" ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      COD Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.codAmount}
                      onChange={(e) => setForm({ ...form, codAmount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Ingesting…" : "Create Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
