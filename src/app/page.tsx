import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/permissions";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect(ROLE_HOME[user.role] ?? "/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="hero" showWordmark href="/" />
        <p className="mt-6 text-lg text-gray-600">
          Warehouse, sorting, dispatch, and last-mile delivery — one traceable
          system.
        </p>
      </div>
      <Link
        href="/login"
        className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 text-center text-lg font-semibold text-white shadow-md"
      >
        Log in
      </Link>
      <Link
        href="/track"
        className="w-full rounded-xl border border-gray-300 bg-white px-6 py-4 text-center text-lg font-semibold"
      >
        Track a parcel
      </Link>
    </main>
  );
}
