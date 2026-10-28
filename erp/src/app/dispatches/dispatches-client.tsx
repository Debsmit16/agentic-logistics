"use client";

import { useCallback, useEffect, useState } from "react";
import { ErpPageHeader } from "@/components/ui/erp-page-header";
import { Modal } from "@/components/ui/modal";
import {
  IconEye,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconSearch,
  IconTag,
  IconTrash,
  IconTruck,
} from "@/components/icons/nav-icons";
import { DispatchStatus, DispatchType } from "@prisma/client";
import { DispatchFormModal, type DispatchFormData } from "@/components/dispatches/dispatch-form-modal";
import { DispatchDetailModal, type DispatchDetail } from "@/components/dispatches/dispatch-detail-modal";
import { DispatchPrintModal } from "@/components/dispatches/dispatch-print-modal";
import { DispatchStatusModal } from "@/components/dispatches/dispatch-status-modal";
import type { ModulePermissionFlags } from "@/lib/permissions/user-module";

export interface DispatchItem {
  id: string;
  tripNumber: string;
  type: DispatchType;
  status: DispatchStatus;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originHub: string;
  destinationHub?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    displayName?: string;
    email?: string;
  } | null;
  orders: {
    id: string;
    orderNumber: string;
    awbNumber: string;
    status: string;
    packageWeight: number;
    paymentMode: string;
    totalAmount: number;
    receiverCity: string;
  }[];
  orderCount: number;
  totalWeight: number;
  totalCod: number;
}

interface DispatchMetrics {
  totalTrips: number;
  draftTrips: number;
  dispatchedTrips: number;
  completedTrips: number;
  totalAssignedOrders: number;
  totalCodAmount: number;
}

const STATUS_FILTERS = [
  { label: "All Trips", value: "ALL" },
  { label: "Draft", value: DispatchStatus.DRAFT },
  { label: "Dispatched", value: DispatchStatus.DISPATCHED },
  { label: "Completed", value: DispatchStatus.COMPLETED },
  { label: "Cancelled", value: DispatchStatus.CANCELLED },
];

export function DispatchesClient() {
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [metrics, setMetrics] = useState<DispatchMetrics>({
    totalTrips: 0,
    draftTrips: 0,
    dispatchedTrips: 0,
    completedTrips: 0,
    totalAssignedOrders: 0,
    totalCodAmount: 0,
  });
  const [permissions, setPermissions] = useState<ModulePermissionFlags>({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<DispatchFormData | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTrip, setDetailTrip] = useState<DispatchDetail | null>(null);

  const [printOpen, setPrintOpen] = useState(false);
  const [printTrip, setPrintTrip] = useState<DispatchDetail | null>(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<DispatchItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DispatchItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDispatches = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("page", String(pageToLoad));
        query.set("limit", String(pagination.limit));
        if (search.trim()) query.set("search", search.trim());
        if (statusFilter !== "ALL") query.set("status", statusFilter);
        if (typeFilter !== "ALL") query.set("type", typeFilter);

        const res = await fetch(`/api/dispatches?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to load dispatches");
        const json = await res.json();

        setDispatches(json.items || json.dispatches || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.metrics) setMetrics(json.metrics);
        if (json.permissions) setPermissions(json.permissions);
      } catch (err) {
        console.error("Error fetching dispatches:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, search, statusFilter, typeFilter]
  );

  useEffect(() => {
    fetchDispatches(1);
  }, [fetchDispatches]);

  const loadTripDetail = async (id: string): Promise<DispatchDetail | null> => {
    try {
      const res = await fetch(`/api/dispatches/${id}`);
      if (!res.ok) throw new Error("Failed to load trip");
      const json = await res.json();
      return json.trip;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleOpenDetail = async (tripId: string) => {
    const fullTrip = await loadTripDetail(tripId);
    if (fullTrip) {
      setDetailTrip(fullTrip);
      setDetailOpen(true);
    }
  };

  const handleOpenPrint = async (tripId: string) => {
    const fullTrip = await loadTripDetail(tripId);
    if (fullTrip) {
      setPrintTrip(fullTrip);
      setPrintOpen(true);
    }
  };

  const handleOpenEdit = async (tripId: string) => {
    const fullTrip = await loadTripDetail(tripId);
    if (fullTrip) {
      setEditingTrip({
        id: fullTrip.id,
        tripNumber: fullTrip.tripNumber,
        type: fullTrip.type,
        vehicleNumber: fullTrip.vehicleNumber,
        driverName: fullTrip.driverName,
        driverPhone: fullTrip.driverPhone,
        originHub: fullTrip.originHub,
        destinationHub: fullTrip.destinationHub || undefined,
        notes: fullTrip.notes || undefined,
        orderIds: fullTrip.orders.map((o) => o.id),
      });
      setFormOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dispatches/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete dispatch trip.");
      }
      setDeleteTarget(null);
      fetchDispatches(pagination.page);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting trip.");
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (st: DispatchStatus) => {
    switch (st) {
      case DispatchStatus.DRAFT:
        return "border-slate-500/30 bg-slate-500/10 text-slate-400";
      case DispatchStatus.DISPATCHED:
        return "border-sky-500/30 bg-sky-500/10 text-sky-400";
      case DispatchStatus.COMPLETED:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case DispatchStatus.CANCELLED:
        return "border-rose-500/30 bg-rose-500/10 text-rose-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <ErpPageHeader
        title="Dispatches & Fleet Routing"
        description="Last-mile courier delivery run-sheets, inter-hub linehaul manifests, and automated consignment transit tracking."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchDispatches(pagination.page)}
              className="btn btn-ghost text-xs"
              title="Refresh list"
            >
              Refresh
            </button>
            {permissions.canCreate && (
              <button
                type="button"
                onClick={() => {
                  setEditingTrip(null);
                  setFormOpen(true);
                }}
                className="btn btn-primary text-xs"
              >
                <IconPlus className="h-4 w-4" />
                <span>New Dispatch Trip</span>
              </button>
            )}
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Active Fleet</span>
          <p className="mt-1 text-2xl font-black text-[var(--text)]">{metrics.totalTrips}</p>
          <span className="text-[11px] text-[var(--muted)]">Total Trips</span>
        </div>

        <div className="rounded-2xl border border-slate-500/20 bg-slate-500/5 p-4 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Under Prep</span>
          <p className="mt-1 text-2xl font-black text-slate-300">{metrics.draftTrips}</p>
          <span className="text-[11px] text-[var(--muted)]">Draft Run-sheets</span>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">On The Road</span>
          <p className="mt-1 text-2xl font-black text-sky-400">{metrics.dispatchedTrips}</p>
          <span className="text-[11px] text-[var(--muted)]">Dispatched</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Completed</span>
          <p className="mt-1 text-2xl font-black text-emerald-400">{metrics.completedTrips}</p>
          <span className="text-[11px] text-[var(--muted)]">Reconciled</span>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Cargo Loaded</span>
          <p className="mt-1 text-2xl font-black text-[var(--text)]">{metrics.totalAssignedOrders}</p>
          <span className="text-[11px] text-[var(--muted)]">Parcels</span>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">COD in Transit</span>
          <p className="mt-1 text-2xl font-black text-amber-400">₹{metrics.totalCodAmount.toFixed(0)}</p>
          <span className="text-[11px] text-[var(--muted)]">Driver Collections</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === f.value
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Right filters: Trip type dropdown + search input */}
        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Modes</option>
            <option value={DispatchType.LAST_MILE}>Last-Mile Delivery</option>
            <option value={DispatchType.LINEHAUL}>Linehaul Transfer</option>
          </select>

          <div className="relative min-w-[240px]">
            <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search trip #, vehicle, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-[var(--muted)]">Loading fleet dispatches...</div>
        ) : dispatches.length === 0 ? (
          <div className="py-20 text-center">
            <IconTruck className="mx-auto h-12 w-12 text-[var(--muted)] opacity-40" />
            <h3 className="mt-3 text-sm font-bold text-[var(--text)]">No dispatch trips found</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {search || statusFilter !== "ALL"
                ? "No trips matched the filter criteria."
                : "Create your first trip or assign orders to dispatch."}
            </p>
            {permissions.canCreate && !search && statusFilter === "ALL" && (
              <button
                type="button"
                onClick={() => {
                  setEditingTrip(null);
                  setFormOpen(true);
                }}
                className="btn btn-primary mt-4 text-xs"
              >
                <IconPlus className="h-4 w-4" />
                <span>Create New Trip</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-raised)]/50 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-3 px-4">Trip Details</th>
                  <th className="py-3 px-4">Vehicle & Driver</th>
                  <th className="py-3 px-4">Route & Depots</th>
                  <th className="py-3 px-4 text-right">Cargo Load</th>
                  <th className="py-3 px-4 text-right">COD Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {dispatches.map((trip) => (
                  <tr key={trip.id} className="transition hover:bg-[var(--surface-raised)]/40">
                    {/* Trip # & Type */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black ${
                            trip.type === DispatchType.LAST_MILE
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-sky-500/20 text-sky-500"
                          }`}
                          title={trip.type === DispatchType.LAST_MILE ? "Last-Mile Delivery" : "Linehaul Transfer"}
                        >
                          {trip.type === DispatchType.LAST_MILE ? "LM" : "LH"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(trip.id)}
                          className="font-mono font-bold text-[var(--text)] hover:text-emerald-500 hover:underline"
                        >
                          {trip.tripNumber}
                        </button>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Vehicle & Driver */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[var(--text)] uppercase">{trip.vehicleNumber}</div>
                      <div className="text-[11px] text-[var(--muted)]">
                        {trip.driverName} · <span className="font-mono">{trip.driverPhone}</span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[var(--text)] truncate max-w-[180px]">{trip.originHub}</div>
                      <div className="text-[11px] text-[var(--muted)] truncate max-w-[180px]">
                        → {trip.destinationHub || "Local Cluster"}
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-[var(--text)]">{trip.orderCount} pkgs</div>
                      <div className="font-mono text-[10px] text-[var(--muted)]">{trip.totalWeight} kg</div>
                    </td>

                    {/* COD */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-amber-500">
                        {trip.totalCod > 0 ? `₹${trip.totalCod.toFixed(2)}` : "—"}
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">
                        {trip.totalCod > 0 ? "COD Collection" : "Prepaid"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(trip.id)}
                          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                          title="View Manifest & Consignments"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPrint(trip.id)}
                          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"
                          title="Print Driver Run-Sheet"
                        >
                          <IconPrinter className="h-4 w-4" />
                        </button>

                        {permissions.canUpdate && (
                          <button
                            type="button"
                            onClick={() => {
                              setStatusTarget(trip);
                              setStatusOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-sky-500 hover:bg-sky-500/10"
                            title="Update Trip Status"
                          >
                            <IconTag className="h-4 w-4" />
                          </button>
                        )}

                        {permissions.canUpdate && trip.status === DispatchStatus.DRAFT && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(trip.id)}
                            className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-500/10"
                            title="Edit Trip Details"
                          >
                            <IconPencil className="h-4 w-4" />
                          </button>
                        )}

                        {permissions.canDelete && trip.status !== DispatchStatus.DISPATCHED && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(trip)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10"
                            title="Delete Trip"
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
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
            <div>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} trips)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchDispatches(pagination.page - 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold hover:bg-[var(--surface-raised)] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchDispatches(pagination.page + 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold hover:bg-[var(--surface-raised)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      {formOpen && (
        <DispatchFormModal
          open={formOpen}
          dispatch={editingTrip}
          onClose={() => {
            setFormOpen(false);
            setEditingTrip(null);
          }}
          onSaved={() => fetchDispatches(pagination.page)}
        />
      )}

      {/* Detail Modal */}
      {detailOpen && (
        <DispatchDetailModal
          open={detailOpen}
          dispatch={detailTrip}
          canManage={permissions.canUpdate}
          onClose={() => {
            setDetailOpen(false);
            setDetailTrip(null);
          }}
          onRefresh={() => fetchDispatches(pagination.page)}
        />
      )}

      {/* Print Run-sheet Modal */}
      {printOpen && (
        <DispatchPrintModal
          open={printOpen}
          dispatch={printTrip}
          onClose={() => {
            setPrintOpen(false);
            setPrintTrip(null);
          }}
        />
      )}

      {/* Status Change Modal */}
      {statusOpen && statusTarget && (
        <DispatchStatusModal
          open={statusOpen}
          dispatch={{
            id: statusTarget.id,
            tripNumber: statusTarget.tripNumber,
            status: statusTarget.status,
            type: statusTarget.type,
            driverName: statusTarget.driverName,
            vehicleNumber: statusTarget.vehicleNumber,
            orderCount: statusTarget.orderCount,
          }}
          onClose={() => {
            setStatusOpen(false);
            setStatusTarget(null);
          }}
          onUpdated={() => fetchDispatches(pagination.page)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Dispatch Trip"
        description={`Are you sure you want to delete trip "${deleteTarget?.tripNumber}" (${deleteTarget?.vehicleNumber})? Attached consignments will be unassigned and returned to the ready pool.`}
        onClose={() => !deleting && setDeleteTarget(null)}
      >
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn btn-ghost text-xs"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

