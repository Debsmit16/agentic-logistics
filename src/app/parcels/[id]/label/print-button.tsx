"use client";

export function PrintLabelButton() {
  return (
    <button
      type="button"
      className="rounded bg-teal-700 px-3 py-1 text-sm text-white"
      onClick={() => window.print()}
    >
      Print
    </button>
  );
}
