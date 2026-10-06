import { en } from "./en";
import { bn } from "./bn";
import { hi } from "./hi";
import type { MessageKey } from "./en";

export type Locale = "en" | "bn" | "hi";

const catalogs: Record<Locale, Record<MessageKey, string>> = {
  en,
  bn,
  hi,
};

export function t(locale: Locale, key: MessageKey): string {
  return catalogs[locale]?.[key] ?? en[key];
}

export { en, bn, hi };
export type { MessageKey };
