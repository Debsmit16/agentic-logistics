import type { Locale } from "./index";

export function parseLocale(value: string | null | undefined): Locale {
  if (value === "bn" || value === "hi") return value;
  return "en";
}
