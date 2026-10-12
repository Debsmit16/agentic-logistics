export function AppLogo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-sm"
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
        </svg>
      </div>
      {!compact ? (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-bold tracking-tight text-[var(--text)]">Agentic</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">Logistics ERP</p>
        </div>
      ) : null}
    </div>
  );
}
