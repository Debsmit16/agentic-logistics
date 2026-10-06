import { Suspense } from "react";
import ResetPasswordClient from "./reset-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
