"use client";

import { useEffect } from "react";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static" role="dialog" aria-modal="true">
      <button type="button" className="no-print absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto custom-scrollbar rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0 ${wide ? "max-w-2xl" : "max-w-lg"}`}
      >
        <div className="no-print border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
        </div>
        <div className="px-6 py-5 print:p-0">{children}</div>
      </div>
    </div>
  );
}
