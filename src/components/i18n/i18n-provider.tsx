"use client";

import { createContext, useContext, useMemo } from "react";
import { t as translate, type Locale, type MessageKey } from "@/lib/i18n";

const I18nContext = createContext<{ locale: Locale; t: (key: MessageKey) => string } | null>(
  null,
);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      t: (key: MessageKey) => translate(locale, key),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return (key: MessageKey) => translate("en", key);
  }
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  return ctx?.locale ?? "en";
}
