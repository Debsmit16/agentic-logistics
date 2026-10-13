import React from "react";

export function ErpPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="erp-hero-title">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

