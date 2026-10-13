import Image from "next/image";
import Link from "next/link";
import { ERP_URL } from "@/lib/brand";

export const metadata = {
  title: "Solutions | Agentic Logistics",
  description: "Autonomous dispatch, express air cargo, automated robotics sorting, and maritime intermodal logistics.",
};

export default function SolutionsPage() {
  const solutions = [
    {
      id: "fleet",
      title: "Autonomous Fleet Dispatching",
      tag: "GROUND FREIGHT",
      image: "/logistics-fleet-terminal.jpg",
      desc: "Algorithmic load allocation, automated dock bay reservations, and continuous telemetry turnarounds across high-volume highway corridors.",
      features: [
        "Dynamic real-time route optimization with weather telemetry",
        "Automated cross-dock bay reservation and ingress gate assignment",
        "Sub-meter GPS tracking with continuous mechanical health monitoring",
      ],
      stats: { primary: "1,280+", label: "Daily Autonomous Dispatches" },
    },
    {
      id: "air",
      title: "Express Air Cargo Charters",
      tag: "AEROSPACE LOGISTICS",
      image: "/air-cargo-global.jpg",
      desc: "Guaranteed transcontinental capacity aboard dedicated widebody cargo aircraft with automated customs pre-clearance and rapid tarmac transfers.",
      features: [
        "Priority ULD container tracking with internal sensor logging",
        "Seamless ground-to-air intermodal cross-dock transfers",
        "Automated IATA customs manifest electronic synchronization",
      ],
      stats: { primary: "<24h", label: "Intercontinental Transit Time" },
    },
    {
      id: "robotics",
      title: "Smart Robotics High-Bay Sorting",
      tag: "AUTOMATED FULFILLMENT",
      image: "/smart-warehouse-robotics.jpg",
      desc: "Zero-latency automated warehousing powered by fleets of autonomous mobile robots (AMRs), robotic pickers, and dynamic buffer staging.",
      features: [
        "Millimeter-level pallet and tote tracking via optical floor telemetry",
        "Machine-vision container inspection and weight certification",
        "Automated replenishment triggers synchronized with ERP inventory",
      ],
      stats: { primary: "99.98%", label: "Robotic Sorting Accuracy" },
    },
    {
      id: "maritime",
      title: "Deepwater Port & Rail Intermodal",
      tag: "PORT & CONTAINER",
      image: "/maritime-port-cargo.jpg",
      desc: "Container yard coordination with automated gantry cranes, marine vessel schedules, and direct-to-rail intermodal freight corridors.",
      features: [
        "Vessel dwell time reduction via pre-allocated crane sequences",
        "Bonded container chain-of-custody tracking from berth to destination",
        "Automated chassis provisioning and port gate fast-pass",
      ],
      stats: { primary: "50,000+", label: "Monthly TEU Capacity" },
    },
  ];

  return (
    <div className="py-16 lg:py-24 mx-auto max-w-7xl px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-md mb-4">
          <Image src="/logo-64.png" alt="Logo" width={16} height={16} />
          <span className="font-mono text-[11px] uppercase tracking-wider">ENTERPRISE SOLUTIONS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Orchestrating Every Leg of the Supply Chain.
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Engineered to give global shippers and terminal operators unified visibility, automated execution, and certified chain-of-custody.
        </p>
      </div>

      {/* Solutions List */}
      <div className="mt-16 space-y-16">
        {solutions.map((s, idx) => (
          <div
            key={s.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-lg ${
              idx % 2 === 1 ? "lg:grid-flow-dense" : ""
            }`}
          >
            {/* Visual Column */}
            <div className={`lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 ${
              idx % 2 === 1 ? "lg:col-start-7" : ""
            }`}>
              <Image src={s.image} alt={s.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="rounded-lg bg-black/70 px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-blue-400 backdrop-blur-md border border-white/10">
                  {s.tag}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Image src="/logo-64.png" alt="Logo" width={20} height={20} />
                  <span className="text-xs font-mono font-semibold">Agentic Verified Node</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-emerald-400">{s.stats.primary}</div>
                  <div className="text-[10px] text-slate-300">{s.stats.label}</div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? "lg:col-start-1" : ""}`}>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {s.title}
              </h2>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>

              <ul className="mt-6 space-y-3">
                {s.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href={ERP_URL}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  Manage in ERP →
                </a>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Request Consultation
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner */}
      <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/logo-64.png" alt="Logo" width={24} height={24} className="brightness-200" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200">
              DISPATCH & FLEET PORTAL
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold">Access the Central ERP Operations Console</h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Authorized personnel can directly monitor active waybills, dock allocations, and warehouse inventory in real time.
          </p>
        </div>
        <a
          href={ERP_URL}
          className="shrink-0 px-7 py-3.5 rounded-xl bg-white text-blue-800 font-bold text-xs shadow-lg hover:bg-blue-50 transition-colors"
        >
          Sign In to ERP Console →
        </a>
      </div>
    </div>
  );
}
