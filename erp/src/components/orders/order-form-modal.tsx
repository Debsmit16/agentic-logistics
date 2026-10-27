"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { OrderStatus, PaymentMode, ServiceType } from "@prisma/client";

export interface OrderFormData {
  id?: string;
  orderNumber?: string;
  awbNumber?: string;
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

  totalAmount: number;
  declaredValue: number;
}

interface OrderFormModalProps {
  open: boolean;
  order?: OrderFormData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function OrderFormModal({ open, order, onClose, onSaved }: OrderFormModalProps) {
  const isEditing = Boolean(order?.id);

  const [formData, setFormData] = useState<OrderFormData>(() => ({
    status: order?.status ?? OrderStatus.CONFIRMED,
    paymentMode: order?.paymentMode ?? PaymentMode.PREPAID,
    serviceType: order?.serviceType ?? ServiceType.STANDARD,

    senderName: order?.senderName ?? "",
    senderPhone: order?.senderPhone ?? "",
    senderAddress: order?.senderAddress ?? "",
    senderCity: order?.senderCity ?? "",
    senderState: order?.senderState ?? "",
    senderPincode: order?.senderPincode ?? "",

    receiverName: order?.receiverName ?? "",
    receiverPhone: order?.receiverPhone ?? "",
    receiverAddress: order?.receiverAddress ?? "",
    receiverCity: order?.receiverCity ?? "",
    receiverState: order?.receiverState ?? "",
    receiverPincode: order?.receiverPincode ?? "",

    itemDescription: order?.itemDescription ?? "",
    packageWeight: order?.packageWeight ?? 1.0,
    lengthCm: order?.lengthCm ?? 20,
    widthCm: order?.widthCm ?? 15,
    heightCm: order?.heightCm ?? 10,

    totalAmount: order?.totalAmount ?? 150,
    declaredValue: order?.declaredValue ?? 1000,
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live calculation of volumetric & chargeable weights
  const { volWeight, chargeableWeight } = useMemo(() => {
    const vol = Number(((formData.lengthCm * formData.widthCm * formData.heightCm) / 5000).toFixed(2));
    const chg = Number(Math.max(formData.packageWeight || 0, vol).toFixed(2));
    return { volWeight: vol, chargeableWeight: chg };
  }, [formData.lengthCm, formData.widthCm, formData.heightCm, formData.packageWeight]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEditing ? `/api/orders/${order?.id}` : "/api/orders";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save order");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Consignment ${order?.orderNumber}` : "Create New Consignment"}
      description="Enter pickup, destination, and package telemetry details."
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Sender & Receiver Columns */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Sender Panel */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Origin / Shipper
              </span>
              <span className="text-[10px] text-[var(--muted)]">Pickup Point</span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Sender Name *</label>
              <input
                type="text"
                required
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="e.g. Acme Logistics Hub"
                className="input mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="input mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Address / Facility *</label>
              <textarea
                required
                rows={2}
                value={formData.senderAddress}
                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                placeholder="Building, street, landmark"
                className="input mt-1 text-xs py-1.5"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)]">City *</label>
                <input
                  type="text"
                  required
                  value={formData.senderCity}
                  onChange={(e) => setFormData({ ...formData, senderCity: e.target.value })}
                  placeholder="City"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)]">State *</label>
                <input
                  type="text"
                  required
                  value={formData.senderState}
                  onChange={(e) => setFormData({ ...formData, senderState: e.target.value })}
                  placeholder="State"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)]">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.senderPincode}
                  onChange={(e) => setFormData({ ...formData, senderPincode: e.target.value })}
                  placeholder="Pincode"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Receiver Panel */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Consignee / Destination
              </span>
              <span className="text-[10px] text-[var(--muted)]">Delivery Point</span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Receiver Name *</label>
              <input
                type="text"
                required
                value={formData.receiverName}
                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                placeholder="e.g. John Doe"
                className="input mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.receiverPhone}
                onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                placeholder="+91 91234 56789"
                className="input mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Street Address *</label>
              <textarea
                required
                rows={2}
                value={formData.receiverAddress}
                onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                placeholder="Flat / house number, street, landmark"
                className="input mt-1 text-xs py-1.5"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)]">City *</label>
                <input
                  type="text"
                  required
                  value={formData.receiverCity}
                  onChange={(e) => setFormData({ ...formData, receiverCity: e.target.value })}
                  placeholder="City"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)]">State *</label>
                <input
                  type="text"
                  required
                  value={formData.receiverState}
                  onChange={(e) => setFormData({ ...formData, receiverState: e.target.value })}
                  placeholder="State"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)]">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.receiverPincode}
                  onChange={(e) => setFormData({ ...formData, receiverPincode: e.target.value })}
                  placeholder="Pincode"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Package Dimensions & Volumetric Telemetry */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/20 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Package Telemetry & Volumetric Weight
            </span>
            <span className="text-[10px] text-[var(--muted)]">IATA formula: (L × W × H) / 5000</span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[var(--muted)]">Item Description *</label>
            <input
              type="text"
              required
              value={formData.itemDescription}
              onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              placeholder="e.g. Industrial Automation Sensors & Wiring"
              className="input mt-1 h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Dead Wt (kg) *</label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                required
                value={formData.packageWeight}
                onChange={(e) => setFormData({ ...formData, packageWeight: parseFloat(e.target.value) || 0 })}
                className="input mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Length (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.lengthCm}
                onChange={(e) => setFormData({ ...formData, lengthCm: parseFloat(e.target.value) || 0 })}
                className="input mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Width (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.widthCm}
                onChange={(e) => setFormData({ ...formData, widthCm: parseFloat(e.target.value) || 0 })}
                className="input mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--muted)]">Height (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })}
                className="input mt-1 h-9 text-xs"
              />
            </div>
          </div>

          {/* Computed Weight Telemetry Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Volumetric</span>
                <p className="font-semibold text-[var(--text)]">{volWeight} kg</p>
              </div>
              <div className="h-6 w-px bg-[var(--border)]" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Dead Weight</span>
                <p className="font-semibold text-[var(--text)]">{formData.packageWeight} kg</p>
              </div>
            </div>
            <div className="rounded-lg bg-[var(--primary-soft)] px-3 py-1 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                Chargeable Weight
              </span>
              <p className="text-sm font-bold text-[var(--primary)]">{chargeableWeight} kg</p>
            </div>
          </div>
        </div>

        {/* Commercial & Service Mode */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="text-[11px] font-medium text-[var(--muted)]">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
              className="input mt-1 h-9 text-xs"
            >
              <option value={ServiceType.STANDARD}>Standard Ground</option>
              <option value={ServiceType.EXPRESS}>Express Air</option>
              <option value={ServiceType.COLD_CHAIN}>Cold Chain (2-8°C)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[var(--muted)]">Payment Mode</label>
            <select
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as PaymentMode })}
              className="input mt-1 h-9 text-xs"
            >
              <option value={PaymentMode.PREPAID}>Prepaid</option>
              <option value={PaymentMode.COD}>Cash on Delivery (COD)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[var(--muted)]">Freight Charge (₹)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
              className="input mt-1 h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[var(--muted)]">Declared Value (₹)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.declaredValue}
              onChange={(e) => setFormData({ ...formData, declaredValue: parseFloat(e.target.value) || 0 })}
              className="input mt-1 h-9 text-xs"
            />
          </div>
        </div>

        {isEditing && (
          <div>
            <label className="text-[11px] font-medium text-[var(--muted)]">Consignment Lifecycle Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
              className="input mt-1 h-9 text-xs"
            >
              <option value={OrderStatus.DRAFT}>Draft</option>
              <option value={OrderStatus.CONFIRMED}>Confirmed (Ready for Pickup)</option>
              <option value={OrderStatus.IN_TRANSIT}>In Transit (Hub Linehaul)</option>
              <option value={OrderStatus.OUT_FOR_DELIVERY}>Out for Delivery</option>
              <option value={OrderStatus.DELIVERED}>Delivered (Signed e-POD)</option>
              <option value={OrderStatus.CANCELLED}>Cancelled</option>
              <option value={OrderStatus.RTO}>Return to Origin (RTO)</option>
            </select>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary text-xs"
          >
            {saving ? "Saving…" : isEditing ? "Update Consignment" : "Create Consignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
