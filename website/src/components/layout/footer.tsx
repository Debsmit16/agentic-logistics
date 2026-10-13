import Link from "next/link";
import Image from "next/image";
import { ERP_URL } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#050811] text-slate-600 dark:text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <Image src="/logo-128.png" alt="Agentic Logistics" width={28} height={28} />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Agentic Logistics</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
              Autonomous dispatch telemetry, automated parcel sorting, and real-time multi-modal logistics across 42 global distribution hubs.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All 42 Global Hubs Operational</span>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Solutions</h4>
            <ul className="space-y-2">
              <li><Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Autonomous Dispatch</Link></li>
              <li><Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cold Chain Freight</Link></li>
              <li><Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Express Air Cargo</Link></li>
              <li><Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Multi-Modal Rail & Port</Link></li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Infrastructure</h4>
            <ul className="space-y-2">
              <li><Link href="/network" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Global 42 Hubs</Link></li>
              <li><Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fleet Operations</Link></li>
              <li><a href={ERP_URL} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">ERP Console</a></li>
              <li><Link href="/company" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Zero-Trust Security</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/company" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Sales</Link></li>
              <li><span className="text-slate-400 cursor-pointer">Security Certifications</span></li>
              <li><span className="text-slate-400 cursor-pointer">Status Dashboard</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-6 text-[11px] text-slate-500">
          <p>© 2026 Agentic Logistics Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-3 sm:mt-0">
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="font-mono text-slate-400">v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
