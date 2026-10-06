"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <input
        type="password"
        className="mt-4 w-full rounded border px-3 py-2"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        className="mt-3 w-full rounded bg-teal-700 py-3 text-white"
        onClick={async () => {
          const res = await fetch("/api/auth/password-reset", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            setMsg(data.error);
            return;
          }
          router.push("/login");
        }}
      >
        Save password
      </button>
      {msg ? <p className="mt-3 text-red-700">{msg}</p> : null}
    </main>
  );
}
