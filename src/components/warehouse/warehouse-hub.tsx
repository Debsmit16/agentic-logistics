"use client";

import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/page-header";
import { ActionTile } from "@/components/ui/action-tile";
import {
  ArrowDownToLine,
  Boxes,
  ArrowLeftRight,
  Search,
  Layers,
  Undo2,
} from "lucide-react";

export function WarehouseHub({ locale }: { locale: Locale }) {
  const tiles = [
    {
      href: "/warehouse/receive",
      title: t(locale, "receive"),
      desc: t(locale, "whReceiveDesc"),
      icon: <ArrowDownToLine className="w-5 h-5" />,
      variant: "primary" as const,
    },
    {
      href: "/warehouse/store",
      title: t(locale, "store"),
      desc: t(locale, "whStoreDesc"),
      icon: <Boxes className="w-5 h-5" />,
      variant: "secondary" as const,
    },
    {
      href: "/warehouse/move",
      title: t(locale, "move"),
      desc: t(locale, "whMoveDesc"),
      icon: <ArrowLeftRight className="w-5 h-5" />,
      variant: "secondary" as const,
    },
    {
      href: "/warehouse/find",
      title: t(locale, "find"),
      desc: t(locale, "whFindDesc"),
      icon: <Search className="w-5 h-5" />,
      variant: "secondary" as const,
    },
    {
      href: "/warehouse/sort",
      title: t(locale, "sort"),
      desc: t(locale, "whSortDesc"),
      icon: <Layers className="w-5 h-5" />,
      variant: "accent" as const,
    },
    {
      href: "/warehouse/returns",
      title: t(locale, "returns"),
      desc: t(locale, "whReturnsDesc"),
      icon: <Undo2 className="w-5 h-5" />,
      variant: "accent" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title={t(locale, "warehouseHub")}
        description={t(locale, "warehouseHubDesc")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((item) => (
          <ActionTile
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.desc}
            icon={item.icon}
            variant={item.variant}
          />
        ))}
      </div>
    </div>
  );
}
