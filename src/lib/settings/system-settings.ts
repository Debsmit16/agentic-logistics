import { prisma } from "@/lib/db";

export const SETTING_KEYS = {
  appName: "app_name",
  supportEmail: "support_email",
  timezone: "timezone",
} as const;

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.appName]: "Agentic Logistics",
  [SETTING_KEYS.supportEmail]: "support@agenticlogistics.in",
  [SETTING_KEYS.timezone]: "Asia/Kolkata",
};

export async function getGeneralSettings() {
  const rows = await prisma.systemSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    appName: map.get(SETTING_KEYS.appName) ?? DEFAULTS[SETTING_KEYS.appName],
    supportEmail: map.get(SETTING_KEYS.supportEmail) ?? DEFAULTS[SETTING_KEYS.supportEmail],
    timezone: map.get(SETTING_KEYS.timezone) ?? DEFAULTS[SETTING_KEYS.timezone],
  };
}

export async function updateGeneralSettings(input: {
  appName?: string;
  supportEmail?: string;
  timezone?: string;
}) {
  const updates: { key: string; value: string }[] = [];
  if (input.appName !== undefined) updates.push({ key: SETTING_KEYS.appName, value: input.appName.trim() });
  if (input.supportEmail !== undefined) updates.push({ key: SETTING_KEYS.supportEmail, value: input.supportEmail.trim() });
  if (input.timezone !== undefined) updates.push({ key: SETTING_KEYS.timezone, value: input.timezone.trim() });

  for (const u of updates) {
    await prisma.systemSetting.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value },
      update: { value: u.value },
    });
  }

  return getGeneralSettings();
}
