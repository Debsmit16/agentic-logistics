export function ErpPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6">
      <h1 className="erp-hero-title">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{description}</p>
    </header>
  );
}
