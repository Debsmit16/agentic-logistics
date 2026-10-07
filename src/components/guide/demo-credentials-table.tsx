"use client";

import type { SystemRole } from "@prisma/client";
import { useT } from "@/components/i18n/i18n-provider";
import { DEMO_TEST_ACCOUNTS, SUPERADMIN_ACCOUNT } from "@/lib/guide/demo-test-accounts";

function roleLabel(role: SystemRole): string {
  return role.replaceAll("_", " ");
}

export function DemoCredentialsTable() {
  const t = useT();

  return (
    <div className="erp-cred-table-wrap">
      <table className="erp-cred-table">
        <thead>
          <tr>
            <th>{t("superadminCredColRole")}</th>
            <th>{t("superadminCredColEmail")}</th>
            <th>{t("superadminCredColPassword")}</th>
            <th>{t("superadminCredColHome")}</th>
          </tr>
        </thead>
        <tbody>
          {DEMO_TEST_ACCOUNTS.map((row) => (
            <tr key={row.email}>
              <td>{roleLabel(row.role)}</td>
              <td>
                <code className="erp-cred-code">{row.email}</code>
              </td>
              <td>
                <code className="erp-cred-code">{row.password}</code>
              </td>
              <td className="text-slate-600">{row.homePath}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>OWNER (superadmin)</td>
            <td>
              <code className="erp-cred-code">{SUPERADMIN_ACCOUNT.email}</code>
            </td>
            <td>
              <code className="erp-cred-code">{SUPERADMIN_ACCOUNT.password}</code>
            </td>
            <td className="text-slate-600">/dashboard</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
