import type { MessageKey } from "@/lib/i18n/en";

export type SuperadminGuideStep = {
  id: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  href?: string;
  showCredentials?: boolean;
  showLifecycle?: boolean;
};

export const SUPERADMIN_GUIDE_STEPS: SuperadminGuideStep[] = [
  {
    id: "intro",
    titleKey: "superadminGuideIntroTitle",
    bodyKey: "superadminGuideIntroBody",
  },
  {
    id: "credentials",
    titleKey: "superadminCredTitle",
    bodyKey: "superadminCredBody",
    showCredentials: true,
  },
  {
    id: "e2e",
    titleKey: "superadminE2eTitle",
    bodyKey: "superadminE2eBody",
    showLifecycle: true,
  },
  {
    id: "warehouse-mgr",
    titleKey: "superadminPlayWhMgrTitle",
    bodyKey: "superadminPlayWhMgrBody",
    href: "/warehouse",
  },
  {
    id: "warehouse-staff",
    titleKey: "superadminPlayWhStaffTitle",
    bodyKey: "superadminPlayWhStaffBody",
    href: "/warehouse/receive",
  },
  {
    id: "delivery-mgr",
    titleKey: "superadminPlayDmTitle",
    bodyKey: "superadminPlayDmBody",
    href: "/delivery",
  },
  {
    id: "delivery-boy",
    titleKey: "superadminPlayRiderTitle",
    bodyKey: "superadminPlayRiderBody",
    href: "/delivery/my",
  },
  {
    id: "accountant",
    titleKey: "superadminPlayAccTitle",
    bodyKey: "superadminPlayAccBody",
    href: "/finance",
  },
];
