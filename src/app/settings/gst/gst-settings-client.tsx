"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

export default function GstSettingsClient() {
  const t = useT();
  const [profile, setProfile] = useState({
    legalName: "",
    gstin: "",
    address: "",
    stateCode: "27",
    defaultFreightRatePerKg: 12,
    gstRatePercent: 18,
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/gst")
      .then((r) => r.json())
      .then((d) => setProfile({ ...profile, ...d.profile }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{t("gstSettingsTitle")}</h1>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <label className="block text-sm">
        {t("legalName")}
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={profile.legalName}
          onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
        />
      </label>
      <label className="block text-sm">
        {t("gstin")}
        <input
          className="mt-1 w-full rounded border px-3 py-2 font-mono"
          value={profile.gstin}
          onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
        />
      </label>
      <label className="block text-sm">
        {t("businessAddress")}
        <textarea
          className="mt-1 w-full rounded border px-3 py-2"
          rows={3}
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
        />
      </label>
      <label className="block text-sm">
        {t("stateCode")}
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={profile.stateCode}
          onChange={(e) => setProfile({ ...profile, stateCode: e.target.value })}
        />
      </label>
      <label className="block text-sm">
        {t("defaultFreightRate")}
        <input
          type="number"
          className="mt-1 w-full rounded border px-3 py-2"
          value={profile.defaultFreightRatePerKg}
          onChange={(e) =>
            setProfile({ ...profile, defaultFreightRatePerKg: Number(e.target.value) })
          }
        />
      </label>
      <label className="block text-sm">
        {t("gstRatePercent")}
        <input
          type="number"
          className="mt-1 w-full rounded border px-3 py-2"
          value={profile.gstRatePercent}
          onChange={(e) => setProfile({ ...profile, gstRatePercent: Number(e.target.value) })}
        />
      </label>
      <button
        type="button"
        className="rounded bg-teal-700 px-4 py-2 text-white"
        onClick={async () => {
          const res = await fetch("/api/settings/gst", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
          setMsg(res.ok ? t("saved") : t("error"));
        }}
      >
        {t("save")}
      </button>
    </div>
  );
}
