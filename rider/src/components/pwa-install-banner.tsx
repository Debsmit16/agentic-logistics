"use client";

import { useEffect, useState } from "react";
import { IconDownload, IconCross } from "./icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="mx-4 my-2 flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-3 shadow-sm animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 shadow-sm">
          <IconDownload className="h-4 w-4" />
        </div>
        <div>
          <p className="font-display text-xs font-bold text-slate-900 tracking-tight">Install Rider Console</p>
          <p className="text-[10px] text-slate-500">Add to Home Screen for fast offline telemetry</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-xl bg-blue-600 px-3 py-1.5 font-display text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95 cursor-pointer"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <IconCross className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
