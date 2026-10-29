"use client";

import { useState, useRef, useCallback } from "react";
import { useBarcodeScanner } from "@/lib/scanner/use-barcode-scanner";
import { playBeepSuccess, playBeepError, playBeepWarning } from "@/lib/scanner/sound-effects";
import { ScannerMode, ScanResult } from "@/lib/scanner/scanner-service";
import { printIsolatedElement } from "@/lib/print-utils";

interface DispatchTripOption {
  id: string;
  tripNumber: string;
  vehicleNumber: string;
  driverName: string;
  status: string;
  type: string;
  _count: { orders: number };
}

interface ScanHistoryEntry {
  id: string;
  awbNumber: string;
  mode: ScannerMode;
  success: boolean;
  message: string;
  timestamp: string;
  receiverCity?: string;
  receiverPincode?: string;
  packageWeight?: number;
  paymentMode?: string;
  totalAmount?: number;
  itemDescription?: string;
  senderName?: string;
  senderCity?: string;
  senderPincode?: string;
  receiverName?: string;
  receiverState?: string;
  orderNumber?: string;
}

export function ScannerClient({ initialTrips }: { initialTrips: DispatchTripOption[] }) {
  const [mode, setMode] = useState<ScannerMode>("INWARD");
  const [selectedHub, setSelectedHub] = useState("Central Sorting Facility");
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTrips[0]?.id || "");
  const [targetDestination, setTargetDestination] = useState<string>("Mumbai");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);

  // Manual fallback input
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Active scan result for large 2-meter HUD display
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);

  // Selected order for 100x150mm label print
  const [labelOrder, setLabelOrder] = useState<ScanHistoryEntry | null>(null);

  const scanCount = scanHistory.length;
  const successCount = scanHistory.filter((s) => s.success).length;
  const errorCount = scanHistory.filter((s) => !s.success).length;

  // Process barcode scan
  const executeScan = useCallback(
    async (rawBarcode: string) => {
      const clean = rawBarcode.replace(/^\*+|\*+$/g, "").trim().toUpperCase();
      if (!clean) return;

      setIsProcessing(true);

      try {
        const res = await fetch("/api/hub/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode: clean,
            mode,
            hubName: selectedHub,
            dispatchTripId: mode === "STAGE_DISPATCH" ? selectedTripId : undefined,
            targetDestination: mode === "VERIFY_DESTINATION" ? targetDestination : undefined,
          }),
        });

        const data = await res.json().catch(() => ({}));
        const result: ScanResult = data.result || {
          success: false,
          action: mode,
          message: data.error || `Server error (${res.status})`,
          order: null,
          timestamp: new Date().toISOString(),
        };

        setActiveScan(result);

        // Audio feedback
        if (audioEnabled) {
          if (result.success) {
            playBeepSuccess();
          } else {
            playBeepError();
          }
        }

        // Add to history
        const historyEntry: ScanHistoryEntry = {
          id: `${Date.now()}-${clean}`,
          awbNumber: clean,
          mode,
          success: result.success,
          message: result.message,
          timestamp: result.timestamp,
          receiverCity: result.order?.receiverCity,
          receiverPincode: result.order?.receiverPincode,
          packageWeight: result.order?.packageWeight,
          paymentMode: result.order?.paymentMode,
          totalAmount: result.order?.totalAmount,
          itemDescription: result.order?.itemDescription,
          senderName: result.order?.senderName,
          senderCity: result.order?.senderCity,
          senderPincode: result.order?.senderPincode,
          receiverName: result.order?.receiverName,
          receiverState: result.order?.receiverState,
          orderNumber: result.order?.orderNumber,
        };

        setScanHistory((prev) => [historyEntry, ...prev.slice(0, 49)]);

        // Auto-print 100x150mm label if enabled and order found
        if (autoPrintEnabled && result.success && result.order) {
          setLabelOrder(historyEntry);
          setTimeout(() => {
            printIsolatedElement("scanner-thermal-label-hidden", "thermal");
          }, 200);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Network error during scan";
        if (audioEnabled) playBeepError();
        setActiveScan({
          success: false,
          action: mode,
          message: errorMsg,
          order: null,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [mode, selectedHub, selectedTripId, targetDestination, audioEnabled, autoPrintEnabled]
  );

  // Hook up physical USB / Bluetooth keyboard-wedge scanner
  useBarcodeScanner({
    onScan: executeScan,
    enabled: true,
  });

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    executeScan(manualInput.trim());
    setManualInput("");
  }

  function handlePrintThermalLabel(entry: ScanHistoryEntry) {
    setLabelOrder(entry);
    setTimeout(() => {
      printIsolatedElement("scanner-thermal-label-hidden", "thermal");
    }, 150);
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. Station Control Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hub Barcode Scanner Station
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Laser Gun Ready</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Supports all USB & Bluetooth HID handheld barcode guns. Pull the trigger to scan instantly from anywhere on screen.
          </p>
        </div>

        {/* Top Controls: Hub Selector & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hub Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Hub:</span>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Central Sorting Facility">Central Sorting Facility</option>
              <option value="Mumbai Origin Hub">Mumbai Origin Hub</option>
              <option value="Delhi Gateway Terminal">Delhi Gateway Terminal</option>
              <option value="Bengaluru Cargo Terminal">Bengaluru Cargo Terminal</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              audioEnabled
                ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Web Audio Synthesizer Beeps"
          >
            {audioEnabled ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Beeps Active</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span>Muted</span>
              </>
            )}
          </button>

          {/* Auto-Print 100x150mm Label Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <input
              type="checkbox"
              checked={autoPrintEnabled}
              onChange={(e) => setAutoPrintEnabled(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Auto-Print 100×150mm</span>
          </label>
        </div>
      </div>

      {/* ─── 2. Mode Selector Navigation Tabs ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setMode("INWARD")}
          className={`flex items-center gap-3 rounded-2xl p-4 text-left border transition-all ${
            mode === "INWARD"
              ? "border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-600"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
            📥
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Mode A</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">Hub Inwarding</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("STAGE_DISPATCH")}
          className={`flex items-center gap-3 rounded-2xl p-4 text-left border transition-all ${
            mode === "STAGE_DISPATCH"
              ? "border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-600"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            🚚
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Mode B</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">Stage to Runsheet</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("LOOKUP")}
          className={`flex items-center gap-3 rounded-2xl p-4 text-left border transition-all ${
            mode === "LOOKUP"
              ? "border-emerald-600 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-600"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            🔍
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Mode C</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">Lookup & Print</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("VERIFY_DESTINATION")}
          className={`flex items-center gap-3 rounded-2xl p-4 text-left border transition-all ${
            mode === "VERIFY_DESTINATION"
              ? "border-amber-600 bg-amber-600/10 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-600"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold">
            🎯
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Mode D</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">Route Sort Check</div>
          </div>
        </button>
      </div>

      {/* Mode Sub-configuration (e.g. Driver Runsheet Picker for Mode B) */}
      {mode === "STAGE_DISPATCH" && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Target Runsheet:</span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {initialTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.tripNumber} — {trip.driverName} ({trip.vehicleNumber}) [{trip._count.orders} Staged]
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-indigo-300">
            Parcels scanned will be automatically appended to this dispatch trip.
          </span>
        </div>
      )}

      {mode === "VERIFY_DESTINATION" && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Target Destination Filter:</span>
          <input
            type="text"
            value={targetDestination}
            onChange={(e) => setTargetDestination(e.target.value)}
            placeholder="e.g. Mumbai, 400059, Maharashtra"
            className="rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <span className="text-xs text-amber-300">
            Scanner will buzz warning tone if scanned parcel is not destined for this area.
          </span>
        </div>
      )}

      {/* ─── 3. Massive 2-Meter Visual Scan HUD ─── */}
      <div
        className={`relative rounded-3xl border-2 transition-all p-8 sm:p-12 text-center shadow-xl overflow-hidden ${
          !activeScan
            ? "border-blue-500/30 bg-gradient-to-b from-blue-950/10 via-slate-900/60 to-slate-950/90 text-white"
            : activeScan.success
            ? "border-emerald-500 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-slate-950/90 text-white shadow-emerald-500/10"
            : "border-red-500 bg-gradient-to-b from-red-950/20 via-slate-900/80 to-slate-950/90 text-white shadow-red-500/10 animate-shake"
        }`}
      >
        {/* Ambient Glow */}
        <div
          className={`absolute inset-0 pointer-events-none blur-3xl opacity-20 ${
            activeScan?.success ? "bg-emerald-500" : activeScan ? "bg-red-500" : "bg-blue-500"
          }`}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {!activeScan ? (
            /* Idle / Waiting for Scan */
            <div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-6 shadow-inner">
                <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready for Barcode Gun
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400">
                Point your scanner at the 100×150mm parcel label and pull the trigger.
              </p>

              {/* Demo Click Pills */}
              <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs">
                <span className="text-slate-500">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => executeScan("AWB-699902477")}
                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 font-mono text-blue-300 transition-colors"
                >
                  AWB-699902477 (Amit Patel)
                </button>
                <button
                  type="button"
                  onClick={() => executeScan("AWB-815606218")}
                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 font-mono text-blue-300 transition-colors"
                >
                  AWB-815606218 (Priya Sharma)
                </button>
              </div>
            </div>
          ) : (
            /* Active Scan Result */
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase mb-4 ${
                  activeScan.success
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                <span>{activeScan.success ? "✓ SCAN CONFIRMED" : "⚠ SCAN EXCEPTION"}</span>
              </div>

              <div className="font-mono text-3xl sm:text-5xl font-black tracking-tight">
                {activeScan.order?.awbNumber || "UNRECOGNIZED"}
              </div>

              <p
                className={`mt-3 text-base sm:text-lg font-semibold ${
                  activeScan.success ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {activeScan.message}
              </p>

              {activeScan.order && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-left text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Destination</span>
                    <div className="font-bold text-white mt-0.5">
                      {activeScan.order.receiverCity} ({activeScan.order.receiverPincode})
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Consignee</span>
                    <div className="font-bold text-white mt-0.5 truncate">
                      {activeScan.order.receiverName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Payment</span>
                    <div className="font-bold text-white mt-0.5">
                      {activeScan.order.paymentMode}{" "}
                      {activeScan.order.paymentMode === "COD" ? `(₹${activeScan.order.totalAmount})` : ""}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Weight / Items</span>
                    <div className="font-bold text-white mt-0.5">
                      {activeScan.order.packageWeight} kg · {activeScan.order.itemDescription}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {activeScan.order && (
                  <button
                    type="button"
                    onClick={() => {
                      const entry: ScanHistoryEntry = {
                        id: activeScan.order!.id,
                        awbNumber: activeScan.order!.awbNumber,
                        mode,
                        success: true,
                        message: activeScan.message,
                        timestamp: activeScan.timestamp,
                        receiverCity: activeScan.order!.receiverCity,
                        receiverPincode: activeScan.order!.receiverPincode,
                        packageWeight: activeScan.order!.packageWeight,
                        paymentMode: activeScan.order!.paymentMode,
                        totalAmount: activeScan.order!.totalAmount,
                        itemDescription: activeScan.order!.itemDescription,
                        senderName: activeScan.order!.senderName,
                        senderCity: activeScan.order!.senderCity,
                        senderPincode: activeScan.order!.senderPincode,
                        receiverName: activeScan.order!.receiverName,
                        receiverState: activeScan.order!.receiverState,
                        orderNumber: activeScan.order!.orderNumber,
                      };
                      handlePrintThermalLabel(entry);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print 100×150mm Thermal Label</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveScan(null)}
                  className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  Clear Screen (Next Scan)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. Manual Fallback Input ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            data-scanner-input="true"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Manual Fallback: Type or Paste AWB # (e.g. AWB-699902477) and press Enter"
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wider"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || isProcessing}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-all"
          >
            {isProcessing ? "Processing..." : "Process Scan"}
          </button>
        </form>
      </div>

      {/* ─── 5. Real-Time Scan Session Ledger ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Scan Session Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live audit ledger of all barcodes captured during this sorting shift
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
              Total: <strong>{scanCount}</strong>
            </span>
            <span className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 font-semibold border border-emerald-500/20">
              Success: <strong>{successCount}</strong>
            </span>
            <span className="rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 font-semibold border border-red-500/20">
              Errors: <strong>{errorCount}</strong>
            </span>
          </div>
        </div>

        {scanHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            No parcels scanned yet in this session. Trigger your barcode gun to begin.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Time</th>
                  <th className="px-3 py-2.5">AWB Number</th>
                  <th className="px-3 py-2.5">Mode</th>
                  <th className="px-3 py-2.5">Destination</th>
                  <th className="px-3 py-2.5">Weight / Payment</th>
                  <th className="px-3 py-2.5">Status & Message</th>
                  <th className="px-3 py-2.5 text-right">Label Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scanHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(scan.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {scan.awbNumber}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-500">
                      {scan.mode}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {scan.receiverCity ? (
                        <span>
                          {scan.receiverCity} ({scan.receiverPincode})
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {scan.packageWeight ? `${scan.packageWeight} kg · ` : ""}
                      <span className={scan.paymentMode === "COD" ? "text-amber-500 font-semibold" : "text-emerald-500 font-semibold"}>
                        {scan.paymentMode || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          scan.success
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {scan.message}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {scan.success && (
                        <button
                          type="button"
                          onClick={() => handlePrintThermalLabel(scan)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          🖨️ 100×150mm Label
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 6. Off-Screen 100x150mm Thermal Shipping Label for Isolated Printing ─── */}
      {labelOrder && (
        <div style={{ display: "none" }}>
          <div
            id="scanner-thermal-label-hidden"
            className="thermal-shipping-label"
            style={{
              width: "96mm",
              maxWidth: "96mm",
              height: "144mm",
              maxHeight: "144mm",
              boxSizing: "border-box",
              margin: "2mm auto",
              padding: "8px 10px",
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: 'Arial, Helvetica, "Liberation Sans", sans-serif',
              fontSize: "11px",
              lineHeight: "1.25",
              border: "2px solid #000000",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "4px", marginBottom: "4px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "1px" }}>AGENTIC LOGISTICS</div>
                <div style={{ fontSize: "9px", fontWeight: "700", color: "#333" }}>EXPRESS FREIGHT SYSTEM</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ border: "1.5px solid #000", padding: "1px 6px", fontSize: "11px", fontWeight: "900" }}>
                  STANDARD
                </div>
              </div>
            </div>

            {/* Barcode Block */}
            <div style={{ textAlign: "center", padding: "6px 0", borderBottom: "1.5px solid #000" }}>
              <div style={{ fontFamily: "monospace", fontSize: "32px", letterSpacing: "4px", fontWeight: "bold" }}>
                *{labelOrder.awbNumber}*
              </div>
              <div style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "bold", marginTop: "2px" }}>
                AWB: {labelOrder.awbNumber}
              </div>
            </div>

            {/* Destination Pincode Routing Box */}
            <div style={{ display: "flex", borderBottom: "1.5px solid #000", margin: "4px 0", padding: "4px 0" }}>
              <div style={{ flex: 1, borderRight: "1.5px solid #000", paddingRight: "6px" }}>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#444" }}>DESTINATION PINCODE:</div>
                <div style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "1px" }}>
                  {labelOrder.receiverPincode || "400059"}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                  {labelOrder.receiverCity?.toUpperCase() || "MUMBAI"}
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: "6px", textAlign: "right" }}>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#444" }}>PAYMENT:</div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: labelOrder.paymentMode === "COD" ? "#000" : "#000" }}>
                  {labelOrder.paymentMode} {labelOrder.paymentMode === "COD" ? `₹${labelOrder.totalAmount}` : ""}
                </div>
                <div style={{ fontSize: "10px", marginTop: "2px" }}>
                  Wt: {labelOrder.packageWeight || 1.0} kg
                </div>
              </div>
            </div>

            {/* Consignee Address */}
            <div style={{ borderBottom: "1.5px solid #000", paddingBottom: "6px", marginBottom: "4px" }}>
              <div style={{ fontSize: "9px", fontWeight: "bold", color: "#444" }}>SHIP TO / RECIPIENT:</div>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>{labelOrder.receiverName || "Amit Patel"}</div>
              <div style={{ fontSize: "10px" }}>{labelOrder.receiverCity}, {labelOrder.receiverState} - {labelOrder.receiverPincode}</div>
            </div>

            {/* Consignor Return Address */}
            <div style={{ fontSize: "9px" }}>
              <span style={{ fontWeight: "bold" }}>RETURN ADDRESS (HUB): </span>
              {selectedHub}, Agentic Logistics Gateway.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

