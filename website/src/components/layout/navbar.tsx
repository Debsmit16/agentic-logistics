import Link from "next/link";
import Image from "next/image";
import { ERP_URL } from "@/lib/brand";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs transition-transform group-hover:scale-105">
            <Image
              src="/logo-128.png"
              alt="Agentic Logistics"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Agentic Logistics
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Solutions
          </Link>
          <Link href="/network" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Global Network
          </Link>
          <Link href="/company" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Company
          </Link>
          <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Contact Sales
          </Link>
          <a
            href={ERP_URL}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
          >
            <span>ERP Console</span>
            <span className="text-[10px]">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
