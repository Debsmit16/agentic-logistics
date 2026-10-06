"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";

export default function SystemSettingsClient() {
  const t = useT();
  const [pod, setPod] = useState({
    requireOtp: true,
    requirePhoto: false,
    requireSignature: false,
    requireGps: false,
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/pod")
      .then((r) => r.json())
      .then((d) =>
        setPod({
          requireOtp: d.pod?.requireOtp ?? true,
          requirePhoto: d.pod?.requirePhoto ?? false,
          requireSignature: d.pod?.requireSignature ?? false,
          requireGps: d.pod?.requireGps ?? false,
        }),
      );
  }, []);

  const labels: Record<keyof typeof pod, string> = {
    requireOtp: "Require OTP before delivery",
    requirePhoto: "Require delivery photo",
    requireSignature: "Require customer signature",
    requireGps: "Require GPS at delivery",
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{t("systemPodTitle")}</h1>
      <p className="text-sm text-gray-600">{t("podRequirements")}</p>
      {(Object.keys(pod) as (keyof typeof pod)[]).map((key) => (
        <label key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pod[key]}
            onChange={(e) => setPod({ ...pod, [key]: e.target.checked })}
          />
          {labels[key]}
        </label>
      ))}
      <button
        type="button"
        className="rounded bg-teal-700 px-4 py-2 text-white"
        onClick={async () => {
          const res = await fetch("/api/settings/pod", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pod),
          });
          setMsg(res.ok ? "Saved" : "Error");
        }}
      >
        Save
      </button>
      {msg ? <p>{msg}</p> : null}
    </div>
  );
}
