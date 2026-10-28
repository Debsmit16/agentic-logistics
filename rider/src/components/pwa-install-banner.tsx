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
    <div className="mx-4 my-2 flex items-center justify-between gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-[#0c1222] to-slate-900/60 p-3 shadow-lg backdrop-blur-xl animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
          <IconDownload className="h-4 w-4" />
        </div>
        <div>
          <p className="font-display text-xs font-bold text-white tracking-tight">Install Rider Console</p>
          <p className="text-[10px] text-slate-400">Add to Home Screen for fast offline telemetry</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-xl bg-blue-600 px-3 py-1.5 font-display text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition active:scale-95"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-slate-500 hover:text-slate-300"
        >
          <IconCross className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
