export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="erp-page-header">
      <div className="min-w-0 flex-1">
        <h1 className="erp-page-title">{title}</h1>
        {description ? <p className="erp-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
