"use client";

import { useRouter } from "next/navigation";

export function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();
  return (
    <select
      className="rounded border px-2 py-1 text-sm"
      value={current}
      onChange={async (e) => {
        await fetch("/api/me/language", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredLang: e.target.value }),
        });
        router.refresh();
      }}
    >
      <option value="en">English</option>
      <option value="bn">বাংলা</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
