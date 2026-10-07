"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SystemRole } from "@prisma/client";
import { useT } from "@/components/i18n/i18n-provider";
import { PARCEL_LIFECYCLE } from "@/lib/guide/role-guides";
import { SUPERADMIN_GUIDE_STEPS } from "@/lib/guide/superadmin-guide";
import { isSuperadminRole } from "@/lib/guide/demo-test-accounts";
import { DemoCredentialsTable } from "@/components/guide/demo-credentials-table";

const STORAGE_KEY = "al_superadmin_guide_v2";

export function PlatformGuide({
  role,
  defaultOpen = false,
}: {
  role: SystemRole;
  defaultOpen?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = SUPERADMIN_GUIDE_STEPS;
  const step = steps[stepIndex];

  useEffect(() => {
    if (!isSuperadminRole(role)) return;
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed && defaultOpen) setOpen(true);
  }, [role, defaultOpen]);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, []);

  if (!isSuperadminRole(role)) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="erp-guide-fab"
        onClick={() => {
          setStepIndex(0);
          setOpen(true);
        }}
        aria-label={t("guideTitle")}
        title={t("guideTitle")}
      >
        ?
      </button>

      {open ? (
        <div className="erp-guide-backdrop" role="presentation" onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className={`erp-guide-panel erp-guide-panel--wide ${open ? "erp-guide-panel--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="erp-guide-panel-head">
          <div>
            <h2 className="erp-guide-panel-title">{t("guideTitle")}</h2>
            <p className="erp-guide-panel-sub">{t("guideSubtitle")}</p>
          </div>
          <button type="button" className="erp-icon-btn" onClick={() => setOpen(false)} aria-label={t("guideClose")}>
            ×
          </button>
        </div>

        <div className="erp-guide-progress">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`erp-guide-dot ${i === stepIndex ? "erp-guide-dot--active" : i < stepIndex ? "erp-guide-dot--done" : ""}`}
              onClick={() => setStepIndex(i)}
              aria-label={`${t("guideStepOf")} ${i + 1}`}
            />
          ))}
        </div>

        {step ? (
          <div className="erp-guide-step">
            <p className="erp-guide-step-meta">
              {t("guideStepOf")} {stepIndex + 1} / {steps.length}
            </p>
            <h3 className="erp-guide-step-title">{t(step.titleKey)}</h3>
            <p className="erp-guide-step-body">{t(step.bodyKey)}</p>

            {step.showCredentials ? <DemoCredentialsTable /> : null}

            {step.showLifecycle ? (
              <div className="erp-guide-lifecycle erp-guide-lifecycle--inline">
                <p className="erp-guide-lifecycle-title">{t("guideLifecycleTitle")}</p>
                <ol className="erp-lifecycle">
                  {PARCEL_LIFECYCLE.map((item) => (
                    <li key={item.status}>
                      <span className="erp-lifecycle-badge">{item.status.replaceAll("_", " ")}</span>
                      <span>{t(item.key)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {step.href ? (
              <Link href={step.href} className="erp-btn erp-btn--primary erp-btn--sm" onClick={() => setOpen(false)}>
                {t("guideGoToStep")}
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="erp-guide-nav">
          <button
            type="button"
            className="erp-btn erp-btn--ghost erp-btn--sm"
            disabled={stepIndex <= 0}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            {t("back")}
          </button>
          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              className="erp-btn erp-btn--primary erp-btn--sm"
              onClick={() => setStepIndex((i) => i + 1)}
            >
              {t("guideNext")}
            </button>
          ) : (
            <button type="button" className="erp-btn erp-btn--primary erp-btn--sm" onClick={dismiss}>
              {t("guideDone")}
            </button>
          )}
        </div>

        <button type="button" className="erp-guide-dismiss" onClick={dismiss}>
          {t("guideDismiss")}
        </button>
      </aside>
    </>
  );
}
