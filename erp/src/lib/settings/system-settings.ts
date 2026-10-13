import { prisma } from "@/lib/db";

export const SETTING_KEYS = {
  appName: "app_name",
  supportEmail: "support_email",
  timezone: "timezone",
  currency: "currency",
  retentionDays: "retention_days",
  headquarters: "headquarters",
  maintenanceBanner: "maintenance_banner",
} as const;

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.appName]: "Agentic Logistics",
  [SETTING_KEYS.supportEmail]: "support@agenticlogistics.in",
  [SETTING_KEYS.timezone]: "Asia/Kolkata",
  [SETTING_KEYS.currency]: "INR",
  [SETTING_KEYS.retentionDays]: "90",
  [SETTING_KEYS.headquarters]: "Mumbai, Maharashtra, India",
  [SETTING_KEYS.maintenanceBanner]: "",
};

export async function getGeneralSettings() {
  const rows = await prisma.systemSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    appName: map.get(SETTING_KEYS.appName) ?? DEFAULTS[SETTING_KEYS.appName],
    supportEmail: map.get(SETTING_KEYS.supportEmail) ?? DEFAULTS[SETTING_KEYS.supportEmail],
    timezone: map.get(SETTING_KEYS.timezone) ?? DEFAULTS[SETTING_KEYS.timezone],
    currency: map.get(SETTING_KEYS.currency) ?? DEFAULTS[SETTING_KEYS.currency],
    retentionDays: map.get(SETTING_KEYS.retentionDays) ?? DEFAULTS[SETTING_KEYS.retentionDays],
    headquarters: map.get(SETTING_KEYS.headquarters) ?? DEFAULTS[SETTING_KEYS.headquarters],
    maintenanceBanner: map.get(SETTING_KEYS.maintenanceBanner) ?? DEFAULTS[SETTING_KEYS.maintenanceBanner],
  };
}

export async function updateGeneralSettings(input: {
  appName?: string;
  supportEmail?: string;
  timezone?: string;
  currency?: string;
  retentionDays?: string;
  headquarters?: string;
  maintenanceBanner?: string;
}) {
  const updates: { key: string; value: string }[] = [];
  if (input.appName !== undefined) updates.push({ key: SETTING_KEYS.appName, value: input.appName.trim() });
  if (input.supportEmail !== undefined) updates.push({ key: SETTING_KEYS.supportEmail, value: input.supportEmail.trim() });
  if (input.timezone !== undefined) updates.push({ key: SETTING_KEYS.timezone, value: input.timezone.trim() });
  if (input.currency !== undefined) updates.push({ key: SETTING_KEYS.currency, value: input.currency.trim() });
  if (input.retentionDays !== undefined) updates.push({ key: SETTING_KEYS.retentionDays, value: input.retentionDays.trim() });
  if (input.headquarters !== undefined) updates.push({ key: SETTING_KEYS.headquarters, value: input.headquarters.trim() });
  if (input.maintenanceBanner !== undefined) updates.push({ key: SETTING_KEYS.maintenanceBanner, value: input.maintenanceBanner.trim() });

  for (const u of updates) {
    await prisma.systemSetting.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value },
      update: { value: u.value },
    });
  }

  return getGeneralSettings();
}
