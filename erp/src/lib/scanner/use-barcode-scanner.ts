"use client";

import { useEffect, useRef } from "react";

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minChars?: number;
  maxIntervalMs?: number;
}

/**
 * Universal Keyboard-Wedge Barcode Scanner Hook.
 * Works natively with all USB and Bluetooth handheld laser/imager barcode guns.
 * Detects rapid burst typing and fires onScan(cleanBarcode) on Enter/Tab.
 */
export function useBarcodeScanner({
  onScan,
  enabled = true,
  minChars = 3,
  maxIntervalMs = 75,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    function handleKeyDown(event: KeyboardEvent) {
      // Ignore modifier keys
      if (
        event.key === "Shift" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Meta" ||
        event.key === "CapsLock"
      ) {
        return;
      }

      // Check if user is actively typing in a standard input or textarea
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Check if target is explicitly marked as scanner-input
      const isDedicatedScannerInput =
        target && target.getAttribute("data-scanner-input") === "true";

      // If user is typing in another regular form field and it's NOT a dedicated scanner input,
      // allow normal typing unless it's an extreme high-speed scanner burst (< 30ms)
      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (isInput && !isDedicatedScannerInput && interval > 45) {
        // Normal human typing inside regular input field — do not intercept
        return;
      }

      // Terminator keys: Enter or Tab
      if (event.key === "Enter" || event.key === "Tab") {
        const rawBuffer = bufferRef.current.trim();
        bufferRef.current = "";

        if (rawBuffer.length >= minChars) {
          // Clean standard barcode encapsulation like Code 39 asterisks: *AWB-123456789*
          const cleaned = rawBuffer.replace(/^\*+|\*+$/g, "").trim().toUpperCase();
          if (cleaned.length >= minChars) {
            event.preventDefault();
            event.stopPropagation();
            onScan(cleaned);
          }
        }
        return;
      }

      // Printable single character
      if (event.key.length === 1) {
        // If the gap between keys is too large (> maxIntervalMs) and we're not in dedicated input,
        // reset the buffer because human is typing slowly
        if (bufferRef.current.length > 0 && interval > maxIntervalMs && !isDedicatedScannerInput) {
          bufferRef.current = "";
        }

        bufferRef.current += event.key;
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, onScan, minChars, maxIntervalMs]);
}

