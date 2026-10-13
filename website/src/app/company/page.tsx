import Image from "next/image";
import Link from "next/link";
import { ERP_URL } from "@/lib/brand";

export const metadata = {
  title: "About Us | Agentic Logistics",
  description: "Learn about Agentic Logistics, our mission, security compliance, and global freight orchestration architecture.",
};

export default function CompanyPage() {
  const leadership = [
    {
      name: "Marcus Vance",
      title: "Chief Executive Officer",
      role: "Ex-Maersk Logistics Strategy",
    },
    {
      name: "Dr. Elena Rostova",
      title: "Chief Technology Officer",
      role: "Ex-Autonomous Systems Lead",
    },
    {
      name: "Arjun Nair",
      title: "Head of Global Hub Operations",
      role: "Ex-DHL Supply Chain Director",
    },
    {
      name: "Sophia Chen",
      title: "VP of Enterprise Security & Compliance",
      role: "Ex-Defense Logistics Telemetry",
    },
  ];

  const certifications = [
    { title: "ISO 27001:2022", desc: "Information Security Management System certified across all global nodes." },
    { title: "SOC 2 Type II", desc: "Audited operational security, telemetry privacy, and system availability." },
    { title: "GDP Pharma Compliance", desc: "Certified cold-chain telemetry adherence for pharmaceutical and medical cargo." },
    { title: "AEO / C-TPAT Tier 3", desc: "Authorized Economic Operator priority clearance across international borders." },
  ];

  return (
    <div className="py-16 lg:py-24 mx-auto max-w-7xl px-6 lg:px-8">
      {/* ─── Hero Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-md mb-6">
            <Image src="/logo-64.png" alt="Logo" width={16} height={16} />
            <span className="font-mono text-[11px] uppercase tracking-wider">OUR MISSION & ARCHITECTURE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Architecting the Future of Autonomous Freight.
          </h1>
          <p className="mt-6 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            Agentic Logistics was founded to eliminate latency and operational blind spots in global enterprise supply chains.
            By combining sub-minute hardware telemetry, autonomous dock orchestration, and zero-trust reconciliation, we power 
            reliable distribution across 42 high-throughput hubs worldwide.
          </p>
        </div>

        {/* Branded HQ Facility Image */}
        <div className="lg:col-span-5 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
          <Image
            src="/agentic-enterprise-hero.jpg"
            alt="Agentic Logistics Global Headquarters"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Image src="/logo-64.png" alt="Logo" width={20} height={20} />
              <span className="text-xs font-mono font-bold">Global Operations Center</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              ● NOC LIVE
            </span>
          </div>
        </div>
      </div>

      {/* ─── Numbers / Impact ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-blue-400">42</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Global Hubs</div>
        </div>
        <div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-indigo-400">1.2M+</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Tons Moved Annually</div>
        </div>
        <div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400">99.98%</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">SLA Accuracy</div>
        </div>
        <div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-sky-400">0.00%</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Data Compromise</div>
        </div>
      </div>

      {/* ─── Security & Certifications ─── */}
      <section className="mt-20">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Enterprise Security & Regulatory Compliance
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Mission-critical freight requires zero-compromise security controls and verifiable audit trails.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-xs hover:border-blue-500/40 transition-colors"
            >
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                CERTIFIED
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">{c.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Executive Leadership ─── */}
      <section className="mt-20">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Executive Leadership
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Veteran operators with decades of collective experience in international maritime, aerospace cargo, and distributed robotics.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-xs"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-lg mb-4">
                {m.name.charAt(0)}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{m.title}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/logo-64.png" alt="Logo" width={22} height={22} className="brightness-200" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200">
              AGENTIC LOGISTICS ENTERPRISE
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold">Deploy Agentic Logistics to Your Fleet</h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-xl">
            Integrate our dispatch telemetry directly with your existing warehouse management systems or run on our turnkey ERP.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-white text-blue-800 font-semibold text-xs shadow-md hover:bg-blue-50 transition-colors"
          >
            Contact Sales
          </Link>
          <a
            href={ERP_URL}
            className="px-6 py-3 rounded-xl border border-white/30 bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors"
          >
            ERP Login →
          </a>
        </div>
      </div>
    </div>
  );
}
