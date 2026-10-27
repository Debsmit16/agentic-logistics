"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { Modal } from "@/components/ui/modal";
import {
  IconBox,
  IconEye,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconSearch,
  IconTag,
  IconTrash,
} from "@/components/icons/nav-icons";
import { OrderStatus, PaymentMode, ServiceType } from "@prisma/client";
import { OrderFormModal, type OrderFormData } from "@/components/orders/order-form-modal";
import { OrderDetailModal, type OrderDetail } from "@/components/orders/order-detail-modal";
import { OrderPrintModal } from "@/components/orders/order-print-modal";
import { OrderStatusModal } from "@/components/orders/order-status-modal";
import { OrderLetterheadModal } from "@/components/orders/order-letterhead-modal";
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
    delivered: number;
    totalRevenue: number;
  };
  permissions: ModulePermissionFlags;
  currentUserId: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: OrderStatus.CONFIRMED, label: "Confirmed" },
  { value: OrderStatus.IN_TRANSIT, label: "In Transit" },
  { value: OrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.DRAFT, label: "Draft" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

function statusBadge(status: OrderStatus) {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case OrderStatus.IN_TRANSIT:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
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

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    inPipeline: 0,
    delivered: 0,
    totalRevenue: 0,
  });
  const [permissions, setPermissions] = useState<ModulePermissionFlags | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const [deleteTarget, setDeleteTarget] = useState<OrderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = permissions?.canCreate ?? false;
  const canUpdate = permissions?.canUpdate ?? false;
  const canDelete = permissions?.canDelete ?? false;

  const fetchOrders = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data: OrdersResponse = await res.json();
      setOrders(data.orders ?? []);
      setMetrics(data.metrics ?? { totalOrders: 0, inPipeline: 0, delivered: 0, totalRevenue: 0 });
      setPermissions(data.permissions ?? null);
      setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("[OrdersClient] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  function handleOpenCreate() {
    setEditingOrder(null);
    setFormOpen(true);
  }

  function handleOpenEdit(order: OrderItem) {
    setEditingOrder(order);
    setDetailOpen(false);
    setFormOpen(true);
  }

  function handleOpenDetail(order: OrderItem) {
    setDetailOrder(order);
    setDetailOpen(true);
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
            Active Dispatches
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-amber-500">
            {metrics.inPipeline}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Delivered Shipments
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-500">
            {metrics.delivered}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Freight Tariff Value
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--primary)]">
            ₹{metrics.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Data Panel */}
      <div className="data-panel">
        {/* Panel Header & Action */}
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

          {/* New Order Button — Strictly hidden if user lacks canCreate */}
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

        {/* Search & Filter Toolbar */}
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
            <label className="text-xs font-medium text-[var(--muted)] whitespace-nowrap">Status:</label>
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
              {search || statusFilter !== "ALL"
                ? "No orders match your filter criteria. Try clearing filters."
                : "No orders recorded in the system yet. Create your first consignment to start tracking freight."}
            </p>
            {canCreate && !search && statusFilter === "ALL" && (
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
            <div className="hidden md:block overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Consignment</th>
                    <th>Route (Origin &rarr; Destination)</th>
                    <th>Weight & Service</th>
                    <th>Tariff</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--surface-raised)]/40 transition-colors">
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
                        <div className="text-xs space-y-0.5">
                          <div className="font-medium text-[var(--text)]">
                            {ord.senderCity} &rarr; <span className="font-bold">{ord.receiverCity}</span>
                          </div>
                          <div className="text-[11px] text-[var(--muted)] truncate max-w-[200px]">
                            To: {ord.receiverName} ({ord.receiverPincode})
                          </div>
                        </div>
                      </td>

                      {/* Weight & Service */}
                      <td>
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-[var(--text)]">
                            {ord.chargeableWeight} kg <span className="text-[10px] font-normal text-[var(--muted)]">(chg)</span>
                          </div>
                          <div className="text-[10px] text-[var(--muted)]">
                            {ord.serviceType.replace(/_/g, " ")}
                          </div>
                        </div>
                      </td>

                      {/* Tariff */}
                      <td>
                        <div className="text-xs space-y-0.5">
                          <div className="font-bold text-[var(--text)]">₹{ord.totalAmount.toLocaleString()}</div>
                          <div className="text-[10px] font-medium text-[var(--muted)]">{ord.paymentMode}</div>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status.replace(/_/g, " ")}
                        </span>
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
                              title="Update Shipment Status"
                            >
                              <IconTag className="h-4 w-4" />
                            </button>
                          )}

                          {/* 4. Edit Button — Strictly hidden if canUpdate is false */}
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

                          {/* 5. Delete Button — Strictly hidden if canDelete is false */}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Optimized for Phones & Handheld Devices) */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
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
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status.replace(/_/g, " ")}
                    </span>
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
                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(ord)}
                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                        title="View Details"
                      >
                        <IconEye className="h-4 w-4" />
                      </button>

                      {/* Print Shipping Label (Beside View) */}
                      <button
                        type="button"
                        onClick={() => handleOpenPrint(ord)}
                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                        title="Print Shipping Label"
                      >
                        <IconPrinter className="h-4 w-4" />
                      </button>

                      {/* Status Change (Beside View, guarded by canUpdate) */}
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

                      {/* Edit Button */}
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

                      {/* Delete Button */}
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
              ))}
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

      {/* Order Detail Modal (Pure View Area: No print, no status change controls inside) */}
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

      {/* Shipping Label Print Preview Modal */}
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

      {/* Quick Status Change Modal */}
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
