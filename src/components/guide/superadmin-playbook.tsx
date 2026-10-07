"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { SUPERADMIN_GUIDE_STEPS } from "@/lib/guide/superadmin-guide";
import { DemoCredentialsTable } from "@/components/guide/demo-credentials-table";
import { PARCEL_LIFECYCLE } from "@/lib/guide/role-guides";
import Link from "next/link";

export function SuperadminPlaybook() {
  const t = useT();

  return (
    <section className="erp-card erp-superadmin-playbook">
      <div className="erp-card-head">
        <h2 className="erp-card-title">{t("superadminPlaybookTitle")}</h2>
        <p className="erp-card-desc">{t("superadminPlaybookSubtitle")}</p>
      </div>

      <div className="erp-card-body space-y-6">
        <DemoCredentialsTable />

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

        <ol className="erp-playbook-roles">
          {SUPERADMIN_GUIDE_STEPS.filter((s) => s.id !== "intro" && s.id !== "credentials" && s.id !== "e2e").map(
            (step) => (
              <li key={step.id} className="erp-playbook-role">
                <h3 className="erp-playbook-role-title">{t(step.titleKey)}</h3>
                <p className="erp-playbook-role-body">{t(step.bodyKey)}</p>
                {step.href ? (
                  <Link href={step.href} className="erp-link">
                    {t("guideGoToStep")} →
                  </Link>
                ) : null}
              </li>
            ),
          )}
        </ol>
      </div>
    </section>
  );
}
