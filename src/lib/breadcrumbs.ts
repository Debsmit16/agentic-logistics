export type Crumb = { label: string; href?: string };

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Settings",
  general: "General Settings",
  users: "Users",
  roles: "Roles",
  logs: "System Logs",
  profile: "Profile",
  parcels: "Parcels",
  warehouse: "Warehouse",
  delivery: "Delivery",
  finance: "Finance",
};

export function crumbsForPath(pathname: string): Crumb[] {
  if (pathname === "/dashboard") {
    return [{ label: "Dashboard" }];
  }

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }];

  let path = "";
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    path += `/${seg}`;
    const label = SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === parts.length - 1;
    crumbs.push(isLast ? { label } : { label, href: path });
  }

  return crumbs;
}
