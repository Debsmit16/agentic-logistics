import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <AppLogo size="md" />
      <h1 className="page-title">Access denied</h1>
      <p className="page-lead">You do not have permission for this page.</p>
      <Link href="/dashboard" className="btn btn-primary mt-2">Home</Link>
    </main>
  );
}
