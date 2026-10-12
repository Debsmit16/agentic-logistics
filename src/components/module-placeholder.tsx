import { ErpPageHeader } from "@/components/ui/erp-page-header";

export function ModulePlaceholder({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-6xl">
      <ErpPageHeader title={name} description={`${name} module — coming soon.`} />
      <div className="card p-8 text-center text-sm text-[var(--muted)]">This area will be built in a future release.</div>
    </div>
  );
}
