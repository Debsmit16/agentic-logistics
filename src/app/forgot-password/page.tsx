"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <input
        className="mt-4 w-full rounded border px-3 py-2"
        placeholder="Email or phone"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <button
        type="button"
        className="mt-3 w-full rounded bg-teal-700 py-3 text-white"
        onClick={async () => {
          const res = await fetch("/api/auth/password-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
          });
          const data = await res.json();
          setMsg(data.message);
          setDevUrl(data.devResetUrl ?? null);
        }}
      >
        Send reset link
      </button>
      {msg ? <p className="mt-3 text-sm">{msg}</p> : null}
      {devUrl ? (
        <Link href={devUrl.replace(/^https?:\/\/[^/]+/, "")} className="mt-2 block text-teal-700">
          Dev reset link
        </Link>
      ) : null}
      <Link href="/login" className="mt-6 block text-sm">
        Back to login
      </Link>
    </main>
  );
}
