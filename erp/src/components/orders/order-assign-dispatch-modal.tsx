"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { DispatchType } from "@prisma/client";

interface OrderAssignDispatchModalProps {
  open: boolean;
  orderIds: string[];
  onClose: () => void;
  onAssigned: () => void;
}

interface OpenTrip {
  id: string;
  tripNumber: string;
  type: string;
  status: string;
  vehicleNumber: string;
  driverName: string;
  _count?: { orders: number };
}

export function OrderAssignDispatchModal({
  open,
  orderIds,
  onClose,
  onAssigned,
}: OrderAssignDispatchModalProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [openTrips, setOpenTrips] = useState<OpenTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>("");

  // New trip fields
  const [type, setType] = useState<DispatchType>(DispatchType.LAST_MILE);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [originHub, setOriginHub] = useState("Central Sorting Facility");
  const [destinationHub, setDestinationHub] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setLoadingTrips(true);
      fetch("/api/dispatches?limit=50&status=DRAFT")
        .then((res) => res.json())
        .then((data) => {
          if (data.dispatches) {
            setOpenTrips(data.dispatches);
            if (data.dispatches.length > 0) {
              setSelectedTripId(data.dispatches[0].id);
            } else {
              setMode("new");
            }
          }
        })
        .catch((err) => console.error("Error loading open trips:", err))
        .finally(() => setLoadingTrips(false));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let targetTripId = selectedTripId;

      if (mode === "new") {
        if (!vehicleNumber.trim()) throw new Error("Vehicle number is required.");
        if (!driverName.trim()) throw new Error("Driver name is required.");
        if (!driverPhone.trim()) throw new Error("Driver contact phone is required.");

        // Create new trip first
        const createRes = await fetch("/api/dispatches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            vehicleNumber: vehicleNumber.trim().toUpperCase(),
            driverName: driverName.trim(),
            driverPhone: driverPhone.trim(),
            originHub: originHub.trim(),
            destinationHub: destinationHub.trim() || undefined,
            orderIds,
          }),
        });

        const newTrip = await createRes.json();
        if (!createRes.ok) throw new Error(newTrip.error || "Failed to create trip.");
        targetTripId = newTrip.id;
      } else {
        if (!targetTripId) throw new Error("Please select an active dispatch trip.");

        // Assign to existing trip
        const assignRes = await fetch("/api/dispatches/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dispatchTripId: targetTripId,
            orderIds,
          }),
        });

        const assignJson = await assignRes.json();
        if (!assignRes.ok) throw new Error(assignJson.error || "Failed to assign consignments.");
      }

      onAssigned();
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
      title="Assign Consignments to Dispatch Trip"
      description={`Allocate ${orderIds.length} selected parcel${orderIds.length > 1 ? "s" : ""} to a delivery run-sheet or linehaul transfer.`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-medium text-rose-500">
            {error}
          </div>
        )}

        {/* Tab switch */}
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-1">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === "existing"
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Assign to Open Trip ({openTrips.length})
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === "new"
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            + Create New Trip
          </button>
        </div>

        {mode === "existing" ? (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--text)]">Select Active / Draft Trip</label>
            {loadingTrips ? (
              <div className="p-6 text-center text-xs text-[var(--muted)]">Loading available trips...</div>
            ) : openTrips.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/20 p-6 text-center">
                <p className="text-xs text-[var(--muted)]">No draft trips found.</p>
                <button
                  type="button"
                  onClick={() => setMode("new")}
                  className="mt-2 text-xs font-bold text-emerald-500 hover:underline"
                >
                  Create a new trip instead
                </button>
              </div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto custom-scrollbar">
                {openTrips.map((t) => {
                  const isSelected = selectedTripId === t.id;
                  return (
                    <label
                      key={t.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                        isSelected
                          ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                          : "border-[var(--border)] bg-[var(--surface-raised)]/40 hover:bg-[var(--surface-raised)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="tripRadio"
                          checked={isSelected}
                          onChange={() => setSelectedTripId(t.id)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[var(--text)]">{t.tripNumber}</span>
                            <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                              {t.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--muted)]">
                            {t.vehicleNumber} · Driver: {t.driverName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text)]">
                        {t._count?.orders ?? 0} loaded
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType(DispatchType.LAST_MILE)}
                className={`rounded-lg border p-2 text-center text-xs font-semibold transition ${
                  type === DispatchType.LAST_MILE
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                Last-Mile Delivery
              </button>
              <button
                type="button"
                onClick={() => setType(DispatchType.LINEHAUL)}
                className={`rounded-lg border p-2 text-center text-xs font-semibold transition ${
                  type === DispatchType.LINEHAUL
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-500"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                Linehaul Transfer
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text)]">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-02-EE-1920"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text)] uppercase placeholder:normal-case placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text)]">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text)]">Driver Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text)]">
                  {type === DispatchType.LINEHAUL ? "Destination Hub" : "Cluster / Zone"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. West Distribution Hub"
                  value={destinationHub}
                  onChange={(e) => setDestinationHub(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Assigning..." : `Assign ${orderIds.length} Consignments`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

