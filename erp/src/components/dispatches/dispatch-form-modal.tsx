"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { DispatchType } from "@prisma/client";

export interface DispatchFormData {
  id?: string;
  tripNumber?: string;
  type: DispatchType;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originHub: string;
  destinationHub?: string;
  notes?: string;
  orderIds?: string[];
}

interface EligibleOrder {
  id: string;
  orderNumber: string;
  awbNumber: string;
  status: string;
  receiverName: string;
  receiverCity: string;
  receiverPincode: string;
  packageWeight: number;
  totalAmount: number;
  paymentMode: string;
}

interface DispatchFormModalProps {
  open: boolean;
  dispatch?: DispatchFormData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DispatchFormModal({ open, dispatch, onClose, onSaved }: DispatchFormModalProps) {
  const isEditing = Boolean(dispatch?.id);

  const [type, setType] = useState<DispatchType>(dispatch?.type ?? DispatchType.LAST_MILE);
  const [vehicleNumber, setVehicleNumber] = useState(dispatch?.vehicleNumber ?? "");
  const [driverName, setDriverName] = useState(dispatch?.driverName ?? "");
  const [driverPhone, setDriverPhone] = useState(dispatch?.driverPhone ?? "");
  const [originHub, setOriginHub] = useState(dispatch?.originHub ?? "Central Sorting Facility");
  const [destinationHub, setDestinationHub] = useState(dispatch?.destinationHub ?? "");
  const [notes, setNotes] = useState(dispatch?.notes ?? "");

  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set(dispatch?.orderIds ?? []));
  const [searchOrder, setSearchOrder] = useState("");
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync on modal open or dispatch prop change
  useEffect(() => {
    if (open) {
      setType(dispatch?.type ?? DispatchType.LAST_MILE);
      setVehicleNumber(dispatch?.vehicleNumber ?? "");
      setDriverName(dispatch?.driverName ?? "");
      setDriverPhone(dispatch?.driverPhone ?? "");
      setOriginHub(dispatch?.originHub ?? "Central Sorting Facility");
      setDestinationHub(dispatch?.destinationHub ?? "");
      setNotes(dispatch?.notes ?? "");
      setSelectedOrderIds(new Set(dispatch?.orderIds ?? []));
      setError(null);

      // Load eligible orders if creating a new trip
      if (!dispatch?.id) {
        setLoadingEligible(true);
        fetch("/api/dispatches/eligible-orders")
          .then((res) => res.json())
          .then((data) => {
            if (data.orders) {
              setEligibleOrders(data.orders);
            }
          })
          .catch((err) => console.error("Error loading eligible orders:", err))
          .finally(() => setLoadingEligible(false));
      }
    }
  }, [open, dispatch]);

  const filteredOrders = useMemo(() => {
    if (!searchOrder.trim()) return eligibleOrders;
    const q = searchOrder.toLowerCase();
    return eligibleOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.awbNumber.toLowerCase().includes(q) ||
        o.receiverName.toLowerCase().includes(q) ||
        o.receiverCity.toLowerCase().includes(q) ||
        o.receiverPincode.includes(q)
    );
  }, [eligibleOrders, searchOrder]);

  const stats = useMemo(() => {
    let weight = 0;
    let cod = 0;
    eligibleOrders.forEach((o) => {
      if (selectedOrderIds.has(o.id)) {
        weight += Number(o.packageWeight) || 0;
        if (o.paymentMode === "COD") {
          cod += Number(o.totalAmount) || 0;
        }
      }
    });
    return { weight: weight.toFixed(2), cod: cod.toFixed(2), count: selectedOrderIds.size };
  }, [eligibleOrders, selectedOrderIds]);

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      filteredOrders.forEach((o) => next.add(o.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      filteredOrders.forEach((o) => next.delete(o.id));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleNumber.trim()) {
      setError("Vehicle registration number is required.");
      return;
    }
    if (!driverName.trim()) {
      setError("Driver name is required.");
      return;
    }
    if (!driverPhone.trim()) {
      setError("Driver contact phone is required.");
      return;
    }
    if (!originHub.trim()) {
      setError("Origin hub/facility is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        originHub: originHub.trim(),
        destinationHub: destinationHub.trim() || undefined,
        notes: notes.trim() || undefined,
        orderIds: Array.from(selectedOrderIds),
      };

      const url = isEditing ? `/api/dispatches/${dispatch!.id}` : "/api/dispatches";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save dispatch trip.");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Dispatch Trip: ${dispatch?.tripNumber}` : "Create New Dispatch Trip"}
      description={
        isEditing
          ? "Update fleet allocation, driver credentials, and routing."
          : "Assign vehicle, courier, and select unassigned consignments to generate a manifest."
      }
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-medium text-rose-500">
            {error}
          </div>
        )}

        {/* Dispatch Type Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Trip Operation Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType(DispatchType.LAST_MILE)}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition ${
                type === DispatchType.LAST_MILE
                  ? "border-emerald-500/50 bg-emerald-500/10 text-[var(--text)] ring-1 ring-emerald-500/30"
                  : "border-[var(--border)] bg-[var(--surface-raised)]/40 text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500 text-xs font-bold">
                  LM
                </span>
                <span className="text-sm font-semibold">Last-Mile Delivery</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Local doorstep delivery run-sheet. Orders move to Out for Delivery.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setType(DispatchType.LINEHAUL)}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition ${
                type === DispatchType.LINEHAUL
                  ? "border-sky-500/50 bg-sky-500/10 text-[var(--text)] ring-1 ring-sky-500/30"
                  : "border-[var(--border)] bg-[var(--surface-raised)]/40 text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-500 text-xs font-bold">
                  LH
                </span>
                <span className="text-sm font-semibold">Linehaul Hub Transfer</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Long-distance transit between sorting hubs. Orders move to In Transit.
              </p>
            </button>
          </div>
        </div>

        {/* Fleet & Driver Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Vehicle Registration <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MH-02-EE-1920"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] uppercase placeholder:normal-case placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Driver / Courier Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Sharma"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Driver Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Origin & Destination Hubs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Origin Hub / Depot <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Central Sorting Facility"
              value={originHub}
              onChange={(e) => setOriginHub(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              {type === DispatchType.LINEHAUL ? "Destination Hub" : "Delivery Cluster / Zone"}
            </label>
            <input
              type="text"
              placeholder={
                type === DispatchType.LINEHAUL
                  ? "e.g. North Regional Sorting Hub"
                  : "e.g. South Zone Delivery Cluster"
              }
              value={destinationHub}
              onChange={(e) => setDestinationHub(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)]">Operational Instructions / Notes</label>
          <input
            type="text"
            placeholder="e.g. Gate pass #9102 required, seal locked before departure"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Package / Consignment Selector for New Trip */}
        {!isEditing && (
          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Attach Consignments to Run-Sheet
                </h4>
                <p className="text-[11px] text-[var(--muted)]">
                  Select ready parcels ({eligibleOrders.length} available in depot)
                </p>
              </div>

              {/* Tally Pill */}
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs">
                <div>
                  <span className="text-[var(--muted)]">Selected: </span>
                  <strong className="text-[var(--text)]">{stats.count} pkgs</strong>
                </div>
                <span className="text-[var(--border)]">|</span>
                <div>
                  <span className="text-[var(--muted)]">Wt: </span>
                  <strong className="text-[var(--text)]">{stats.weight} kg</strong>
                </div>
                <span className="text-[var(--border)]">|</span>
                <div>
                  <span className="text-[var(--muted)]">COD: </span>
                  <strong className="text-emerald-500">₹{stats.cod}</strong>
                </div>
              </div>
            </div>

            {/* Quick Filter & Select All */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter by AWB, order #, receiver or pincode..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={selectAllFiltered}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllFiltered}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                Clear
              </button>
            </div>

            {/* Orders list scroll */}
            <div className="max-h-56 overflow-y-auto custom-scrollbar rounded-xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
              {loadingEligible ? (
                <div className="p-6 text-center text-xs text-[var(--muted)]">Scanning eligible parcels...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--muted)]">
                  {searchOrder ? "No ready parcels match filter." : "No unassigned parcels available in hub."}
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isChecked = selectedOrderIds.has(ord.id);
                  return (
                    <label
                      key={ord.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 p-2.5 text-xs transition hover:bg-[var(--surface-raised)]/50 ${
                        isChecked ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOrder(ord.id)}
                          className="h-4 w-4 rounded border-[var(--border)] text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[var(--text)]">{ord.awbNumber}</span>
                            <span className="text-[10px] text-[var(--muted)]">({ord.orderNumber})</span>
                          </div>
                          <p className="text-[11px] text-[var(--muted)]">
                            {ord.receiverName} · {ord.receiverCity} ({ord.receiverPincode})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-semibold text-[var(--text)]">{ord.packageWeight} kg</div>
                        <span
                          className={`text-[10px] font-bold ${
                            ord.paymentMode === "COD" ? "text-amber-500" : "text-emerald-500"
                          }`}
                        >
                          {ord.paymentMode} {ord.paymentMode === "COD" ? `₹${ord.totalAmount}` : ""}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              `Create Trip (${selectedOrderIds.size} pkgs)`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

