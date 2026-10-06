"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useT } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale } from "@/components/i18n/i18n-provider";

export default function TrackClient() {
  const t = useT();
  const locale = useLocale();
  const [awb, setAwb] = useState("");
  const [events, setEvents] = useState<
    { createdAt: string; eventType: string; message: string | null }[]
  >([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function track() {
    setError(null);
    const res = await fetch(`/api/track?q=${encodeURIComponent(awb)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("error"));
      setEvents([]);
      setStatus(null);
      return;
    }
    setStatus(data.parcel.status);
    setEvents(data.parcel.events);
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher current={locale} />
      </div>
      <div className="mb-6 flex justify-center">
        <BrandLogo size="md" href="/" />
      </div>
      <h1 className="text-2xl font-bold">{t("trackHeading")}</h1>
      <input
        className="mt-4 w-full rounded-lg border px-4 py-3"
        placeholder={t("trackPlaceholder")}
        value={awb}
        onChange={(e) => setAwb(e.target.value)}
      />
      <button
        type="button"
        onClick={track}
        className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-semibold text-white"
      >
        {t("trackSubmit")}
      </button>
      {error ? <p className="mt-3 text-red-700">{error}</p> : null}
      {status ? (
        <p className="mt-4 text-lg font-semibold">Status: {status.replaceAll("_", " ")}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {events.map((ev) => (
          <li key={ev.createdAt + ev.eventType} className="rounded-lg border bg-white p-3">
            <p className="text-sm text-gray-500">{new Date(ev.createdAt).toLocaleString()}</p>
            <p className="font-medium">{ev.message ?? ev.eventType}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
