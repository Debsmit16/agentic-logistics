"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { Modal } from "@/components/ui/modal";
import {
  IconBox,
  IconDownload,
  IconEye,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconSearch,
  IconTag,
  IconTrash,
  IconUpload,
} from "@/components/icons/nav-icons";
import { OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { OrderFormModal, type OrderFormData } from "@/components/orders/order-form-modal";
import { OrderDetailModal, type OrderDetail } from "@/components/orders/order-detail-modal";
import { OrderPrintModal } from "@/components/orders/order-print-modal";
import { OrderStatusModal } from "@/components/orders/order-status-modal";
import { OrderLetterheadModal } from "@/components/orders/order-letterhead-modal";
import { OrderBulkUploadModal } from "@/components/orders/order-bulk-upload-modal";
import { OrderBatchStatusModal } from "@/components/orders/order-batch-status-modal";
import type { ModulePermissionFlags } from "@/lib/permissions/user-module";

export interface OrderItem {
  id: string;
  orderNumber: string;
  awbNumber: string;
  status: OrderStatus;
  paymentMode: PaymentMode;
  serviceType: ServiceType;

  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;

  itemDescription: string;
  packageWeight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumetricWeight: number;
  chargeableWeight: number;

  totalAmount: number;
  declaredValue: number;

  deliveryNotes?: string | null;
  ndrReason?: string | null;
  thirdPartyName?: string | null;
  thirdPartyTracking?: string | null;

  createdAt: string;
  createdBy?: { id: string; displayName: string; email: string } | null;
}

interface OrdersResponse {
  orders: OrderItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metrics: {
    totalOrders: number;
    inPipeline: number;
    outForDelivery: number;
    delivered: number;
    rtoCount: number;
    totalRevenue: number;
  };
  permissions: ModulePermissionFlags;
  currentUserId: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: OrderStatus.CONFIRMED, label: "Confirmed" },
  { value: OrderStatus.IN_TRANSIT, label: "In Transit" },
  { value: OrderStatus.HANDED_TO_THIRD_PARTY, label: "Handed to Third-Party" },
  { value: OrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.DRAFT, label: "Draft" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
  { value: OrderStatus.RTO, label: "RTO" },
];

function statusBadge(status: OrderStatus) {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case OrderStatus.IN_TRANSIT:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case OrderStatus.HANDED_TO_THIRD_PARTY:
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case OrderStatus.DELIVERED:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case OrderStatus.CANCELLED:
    case OrderStatus.RTO:
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
}

type TabKey = "ALL" | "PIPELINE" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTIONS";

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    inPipeline: 0,
    outForDelivery: 0,
    delivered: 0,
    rtoCount: 0,
    totalRevenue: 0,
  });
  const [permissions, setPermissions] = useState<ModulePermissionFlags | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Multi-select / Batch Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchPrintOrders, setBatchPrintOrders] = useState<OrderItem[]>([]);
  const [batchPrintOpen, setBatchPrintOpen] = useState(false);
  const [batchStatusOpen, setBatchStatusOpen] = useState(false);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderFormData | null>(null);

  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [printOrder, setPrintOrder] = useState<OrderItem | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  const [statusOrder, setStatusOrder] = useState<OrderItem | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const [letterheadOrder, setLetterheadOrder] = useState<OrderDetail | null>(null);
  const [letterheadOpen, setLetterheadOpen] = useState(false);

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<OrderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = permissions?.canCreate ?? false;
  const canUpdate = permissions?.canUpdate ?? false;
  const canDelete = permissions?.canDelete ?? false;

  const fetchOrders = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(pageToLoad));
        if (search.trim()) params.set("search", search.trim());

        // Resolve effective status from tab or dropdown
        if (statusFilter !== "ALL") {
          params.set("status", statusFilter);
        } else if (activeTab === "OUT_FOR_DELIVERY") {
          params.set("status", OrderStatus.OUT_FOR_DELIVERY);
        } else if (activeTab === "DELIVERED") {
          params.set("status", OrderStatus.DELIVERED);
        } else if (activeTab === "EXCEPTIONS") {
          params.set("status", OrderStatus.RTO);
        } else if (activeTab === "PIPELINE") {
          params.set("status", OrderStatus.IN_TRANSIT);
        }

        const res = await fetch(`/api/orders?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch orders");

        const data: OrdersResponse = await res.json();
        setOrders(data.orders ?? []);
        setMetrics(
          data.metrics ?? {
            totalOrders: 0,
            inPipeline: 0,
            outForDelivery: 0,
            delivered: 0,
            rtoCount: 0,
            totalRevenue: 0,
          },
        );
        setPermissions(data.permissions ?? null);
        setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
      } catch (err) {
        console.error("[OrdersClient] fetch error", err);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, activeTab],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  function handleTabSelect(tab: TabKey) {
    setActiveTab(tab);
    setStatusFilter("ALL");
    setSelectedIds(new Set());
  }

  function handleOpenCreate() {
    setEditingOrder(null);
    setFormOpen(true);
  }

  function handleOpenEdit(order: OrderItem) {
    setEditingOrder(order);
    setDetailOpen(false);
    setFormOpen(true);
  }

  async function handleOpenDetail(order: OrderItem) {
    setDetailOrder(order as unknown as OrderDetail);
    setDetailOpen(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) setDetailOrder(data.order);
      }
    } catch (err) {
      console.error("Failed to load full milestones", err);
    }
  }

  function handleOpenPrint(order: OrderItem) {
    setPrintOrder(order);
    setPrintOpen(true);
  }

  function handleOpenStatus(order: OrderItem) {
    setStatusOrder(order);
    setStatusOpen(true);
  }

  function handleOpenLetterhead(order: OrderDetail) {
    setLetterheadOrder(order);
    setLetterheadOpen(true);
  }

  // Multi-select helpers
  const isAllSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id));

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleOpenBatchPrint() {
    const list = orders.filter((o) => selectedIds.has(o.id));
    if (list.length === 0) return;
    setBatchPrintOrders(list);
    setBatchPrintOpen(true);
  }

  function handleOpenBatchStatus() {
    if (selectedIds.size === 0) return;
    setBatchStatusOpen(true);
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleExportCsv() {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      } else if (activeTab === "OUT_FOR_DELIVERY") {
        params.set("status", OrderStatus.OUT_FOR_DELIVERY);
      } else if (activeTab === "DELIVERED") {
        params.set("status", OrderStatus.DELIVERED);
      } else if (activeTab === "EXCEPTIONS") {
        params.set("status", OrderStatus.RTO);
      } else if (activeTab === "PIPELINE") {
        params.set("status", OrderStatus.IN_TRANSIT);
      }

      const res = await fetch(`/api/orders/export?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: "Export failed" }));
        alert(`Export failed: ${errJson.error || res.statusText}`);
        return;
      }

      const blob = await res.blob();
      const filename = `agentic_manifest_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[OrdersClient] export error", err);
      alert("Failed to export manifest. Please check your network connection.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        if (detailOrder?.id === deleteTarget.id) setDetailOpen(false);
        fetchOrders(pagination.page);
      }
    } catch (err) {
      console.error("[OrdersClient] delete error", err);
    } finally {
      setDeleting(false);
    }
  }

  const STATUS_TABS: { id: TabKey; label: string; count: number }[] = [
    { id: "ALL", label: "All Manifests", count: metrics.totalOrders },
    { id: "PIPELINE", label: "In Pipeline", count: metrics.inPipeline },
    { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", count: metrics.outForDelivery },
    { id: "DELIVERED", label: "Delivered", count: metrics.delivered },
    { id: "EXCEPTIONS", label: "Exceptions / RTO", count: metrics.rtoCount },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <ErpPageHeader
        title="Orders Management"
        description="Book consignments, compute volumetric tariffs, track live AWB telemetry, and manage dispatches."
      />

      {/* Live Operational Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Total Bookings
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--text)]">
            {metrics.totalOrders}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            In Pipeline
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-amber-500">
            {metrics.inPipeline}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Delivered Consignments
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-500">
            {metrics.delivered}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Freight Tariff Invoiced
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--text)]">
            ₹{metrics.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Consignment Manifest Panel */}
      <div className="data-panel">
        {/* Panel Header & Actions */}
        <div className="data-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <IconBox className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text)]">Consignment Manifest</h2>
                <span className="rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                  {pagination.total} {pagination.total === 1 ? "consignment" : "consignments"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Live freight pipeline sorted by most recent bookings
              </p>
            </div>
          </div>

          {/* Action Button Row: Export Excel, Bulk Import, New Order */}
          <div className="flex items-center gap-2">
            {/* Export Excel Manifest */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn btn-ghost text-xs"
              title="Download beautified manifest report in official Excel (.xlsx) format"
            >
              <IconDownload className="h-3.5 w-3.5" />
              Export Excel (.xlsx)
            </button>

            {/* Bulk Excel/CSV Upload */}
            {canCreate && (
              <button
                type="button"
                onClick={() => setBulkUploadOpen(true)}
                className="btn btn-ghost text-xs"
                title="Bulk import consignments from Excel (.xlsx) or CSV spreadsheet"
              >
                <IconUpload className="h-3.5 w-3.5" />
                Bulk Import (Excel / CSV)
              </button>
            )}

            {/* New Order Button */}
            {canCreate && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="btn btn-primary btn-pill text-xs"
              >
                <IconPlus className="h-4 w-4" />
                New Order
              </button>
            )}
          </div>
        </div>

        {/* Quick Status Filter Tabs with Live Counter Badges (Point 3) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[var(--border)] bg-[var(--surface-raised)]/20 px-5 py-2">
          {STATUS_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)]/30 px-5 py-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, AWB, Consignee, City, Pincode…"
              className="input h-9 text-xs !pl-9 font-normal"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[var(--muted)] whitespace-nowrap">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input h-9 w-auto text-xs py-1"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content View: Table for Desktop/Tablet, Responsive Cards for Mobile */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[var(--muted)]">
            Loading consignments from database…
          </div>
        ) : orders.length === 0 ? (
          /* Clean Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--border)] mb-4">
              <IconBox className="h-7 w-7 opacity-50" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)]">No consignments found</h3>
            <p className="mt-1 max-w-sm text-xs text-[var(--muted)] leading-relaxed">
              {search || statusFilter !== "ALL" || activeTab !== "ALL"
                ? "No orders match your filter criteria. Try selecting another tab or clearing search."
                : "No orders recorded in the system yet. Create your first consignment to start tracking freight."}
            </p>
            {canCreate && !search && statusFilter === "ALL" && activeTab === "ALL" && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="btn btn-primary btn-pill mt-4 text-xs"
              >
                <IconPlus className="h-4 w-4" />
                Book First Consignment
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet View */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="erp-table">
                <thead>
                  <tr>
                    {/* Header Checkbox for Batch Selection (Point 5) */}
                    <th className="w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="perm-check"
                        title="Select All Consignments"
                      />
                    </th>
                    <th>Consignment</th>
                    <th>Route (Origin &rarr; Destination)</th>
                    <th>Weight & Service</th>
                    <th>Tariff</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const isSelected = selectedIds.has(ord.id);
                    return (
                      <tr
                        key={ord.id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[var(--primary-soft)]/50"
                            : "hover:bg-[var(--surface-raised)]/40"
                        }`}
                      >
                        {/* Row Checkbox (Point 5) */}
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(ord.id)}
                            className="perm-check"
                          />
                        </td>

                        {/* Consignment */}
                        <td>
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(ord)}
                              className="font-bold text-[var(--text)] hover:text-[var(--primary)] text-left transition-colors"
                            >
                              {ord.orderNumber}
                            </button>
                            <div className="text-[11px] font-mono text-[var(--muted)]">{ord.awbNumber}</div>
                          </div>
                        </td>

                        {/* Route */}
                        <td>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[var(--text)]">
                              {ord.senderCity} &rarr; {ord.receiverCity}
                            </div>
                            <div className="text-[11px] text-[var(--muted)] truncate max-w-[200px]">
                              To: {ord.receiverName} ({ord.receiverPincode})
                            </div>
                          </div>
                        </td>

                        {/* Weight & Service */}
                        <td>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[var(--text)]">
                              {ord.chargeableWeight} kg <span className="text-[11px] font-normal text-[var(--muted)]">chg.</span>
                            </div>
                            <div className="text-[11px] text-[var(--muted)] uppercase">
                              {ord.serviceType.replace(/_/g, " ")} · {ord.paymentMode}
                            </div>
                          </div>
                        </td>

                        {/* Tariff */}
                        <td>
                          <div className="font-bold text-[var(--text)]">
                            ₹{ord.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[var(--muted)]">
                            Val: ₹{ord.declaredValue.toLocaleString()}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <div className="flex flex-col items-start gap-0.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge(
                                ord.status,
                              )}`}
                            >
                              {ord.status === OrderStatus.HANDED_TO_THIRD_PARTY
                                ? "Handed to Third-Party"
                                : ord.status.replace(/_/g, " ")}
                            </span>
                            {ord.status === OrderStatus.HANDED_TO_THIRD_PARTY && ord.thirdPartyName && (
                              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                                via {ord.thirdPartyName}
                                {ord.thirdPartyTracking ? ` (${ord.thirdPartyTracking})` : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions: View, Print Preview, Status Change, Edit, Delete */}
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* 1. View Detail Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(ord)}
                              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)] transition-colors"
                              title="View Consignment Details"
                            >
                              <IconEye className="h-4 w-4" />
                            </button>

                            {/* 2. Print Shipping Label Button (Opens 4x6 Preview) */}
                            <button
                              type="button"
                              onClick={() => handleOpenPrint(ord)}
                              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)] transition-colors"
                              title="Print Shipping Label (4x6 AWB)"
                            >
                              <IconPrinter className="h-4 w-4" />
                            </button>

                            {/* 3. Status Change Button (Beside View, strictly guarded by canUpdate) */}
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleOpenStatus(ord)}
                                className="rounded-lg p-2 text-[var(--muted)] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                title="Update Shipment Status & Log Milestone"
                              >
                                <IconTag className="h-4 w-4" />
                              </button>
                            )}

                            {/* 4. Edit Button */}
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(ord)}
                                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--primary)] transition-colors"
                                title="Edit Consignment"
                              >
                                <IconPencil className="h-4 w-4" />
                              </button>
                            )}

                            {/* 5. Delete Button */}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(ord)}
                                className="rounded-lg p-2 text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                title="Delete Consignment"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {orders.map((ord) => {
                const isSelected = selectedIds.has(ord.id);
                return (
                  <div key={ord.id} className={`p-4 space-y-3 ${isSelected ? "bg-[var(--primary-soft)]/40" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(ord.id)}
                          className="perm-check"
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(ord)}
                            className="text-xs font-bold text-[var(--text)] hover:text-[var(--primary)] text-left"
                          >
                            {ord.orderNumber}
                          </button>
                          <p className="text-[10px] font-mono text-[var(--muted)]">{ord.awbNumber}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusBadge(
                            ord.status,
                          )}`}
                        >
                          {ord.status === OrderStatus.HANDED_TO_THIRD_PARTY
                            ? "Handed to Third-Party"
                            : ord.status.replace(/_/g, " ")}
                        </span>
                        {ord.status === OrderStatus.HANDED_TO_THIRD_PARTY && ord.thirdPartyName && (
                          <span className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400">
                            via {ord.thirdPartyName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[var(--muted)]">Route</span>
                        <p className="font-medium text-[var(--text)]">
                          {ord.senderCity} &rarr; {ord.receiverCity}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[var(--muted)]">Weight</span>
                        <p className="font-medium text-[var(--text)]">{ord.chargeableWeight} kg</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]/50">
                      <div>
                        <span className="font-bold text-[var(--text)]">₹{ord.totalAmount}</span>
                        <span className="text-[10px] text-[var(--muted)] ml-1.5 font-medium">({ord.paymentMode})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(ord)}
                          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                          title="View Details"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPrint(ord)}
                          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                          title="Print Shipping Label"
                        >
                          <IconPrinter className="h-4 w-4" />
                        </button>

                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => handleOpenStatus(ord)}
                            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-amber-500/10 hover:text-amber-600"
                            title="Change Status"
                          >
                            <IconTag className="h-4 w-4" />
                          </button>
                        )}

                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ord)}
                            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--primary)]"
                            title="Edit"
                          >
                            <IconPencil className="h-4 w-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(ord)}
                            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-600"
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">
                <div>
                  Page <strong className="text-[var(--text)]">{pagination.page}</strong> of{" "}
                  <strong className="text-[var(--text)]">{pagination.totalPages}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchOrders(pagination.page - 1)}
                    className="btn btn-ghost h-8 text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchOrders(pagination.page + 1)}
                    className="btn btn-ghost h-8 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Batch Multi-Select Action Bar (Point 5) */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-40 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--primary)] text-xs font-bold text-white">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-[var(--text)]">
              {selectedIds.size === 1 ? "1 Consignment Selected" : `${selectedIds.size} Consignments Selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenBatchPrint}
              className="btn btn-primary text-xs"
              title="Print thermal shipping labels for all selected orders"
            >
              <IconPrinter className="h-3.5 w-3.5" />
              Batch Print Labels
            </button>

            {canUpdate && (
              <button
                type="button"
                onClick={handleOpenBatchStatus}
                className="btn btn-ghost text-xs text-amber-600 dark:text-amber-400"
                title="Bulk update shipment status"
              >
                <IconTag className="h-3.5 w-3.5" />
                Bulk Status
              </button>
            )}

            <button
              type="button"
              onClick={clearSelection}
              className="btn btn-ghost text-xs text-[var(--muted)]"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Order Creation & Edit Modal */}
      {formOpen && (
        <OrderFormModal
          open={formOpen}
          order={editingOrder}
          onClose={() => {
            setFormOpen(false);
            setEditingOrder(null);
          }}
          onSaved={() => fetchOrders(pagination.page)}
        />
      )}

      {/* Order Detail Modal with Milestone Tracking Stepper (Point 1) */}
      {detailOpen && (
        <OrderDetailModal
          open={detailOpen}
          order={detailOrder}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onClose={() => {
            setDetailOpen(false);
            setDetailOrder(null);
          }}
          onEdit={(ord) => handleOpenEdit(ord as unknown as OrderItem)}
          onDelete={(ord) => setDeleteTarget(ord as unknown as OrderItem)}
          onPrintLetterhead={(ord) => handleOpenLetterhead(ord)}
        />
      )}

      {/* Internal Operational Letterhead Manifest Modal */}
      {letterheadOpen && (
        <OrderLetterheadModal
          open={letterheadOpen}
          order={letterheadOrder}
          onClose={() => {
            setLetterheadOpen(false);
            setLetterheadOrder(null);
          }}
        />
      )}

      {/* Single Shipping Label Print Preview Modal */}
      {printOpen && (
        <OrderPrintModal
          open={printOpen}
          order={printOrder}
          onClose={() => {
            setPrintOpen(false);
            setPrintOrder(null);
          }}
        />
      )}

      {/* Batch Shipping Label Print Modal (Point 5) */}
      {batchPrintOpen && (
        <OrderPrintModal
          open={batchPrintOpen}
          order={null}
          orders={batchPrintOrders}
          onClose={() => {
            setBatchPrintOpen(false);
            setBatchPrintOrders([]);
          }}
        />
      )}

      {/* Single Status Change Modal with POD & NDR (Point 4) */}
      {statusOpen && (
        <OrderStatusModal
          open={statusOpen}
          order={statusOrder}
          onClose={() => {
            setStatusOpen(false);
            setStatusOrder(null);
          }}
          onUpdated={() => fetchOrders(pagination.page)}
        />
      )}

      {/* Batch Status Update Modal (Point 5) */}
      {batchStatusOpen && (
        <OrderBatchStatusModal
          open={batchStatusOpen}
          orderIds={Array.from(selectedIds)}
          onClose={() => {
            setBatchStatusOpen(false);
            clearSelection();
          }}
          onUpdated={() => fetchOrders(pagination.page)}
        />
      )}

      {/* Bulk CSV Upload Modal (Point 2) */}
      {bulkUploadOpen && (
        <OrderBulkUploadModal
          open={bulkUploadOpen}
          onClose={() => setBulkUploadOpen(false)}
          onImported={() => fetchOrders(1)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Consignment"
        description={`Are you sure you want to delete order “${deleteTarget?.orderNumber}” (AWB: ${deleteTarget?.awbNumber})? This will permanently remove it from the database.`}
        onClose={() => !deleting && setDeleteTarget(null)}
      >
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn btn-ghost text-xs"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn bg-red-600 text-white hover:bg-red-700 text-xs"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Consignment"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
