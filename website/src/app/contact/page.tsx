"use client";

import { useState } from "react";
import Image from "next/image";
import { ERP_URL } from "@/lib/brand";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    fleetSize: "50-250 vehicles",
    service: "Autonomous Dispatch",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="py-16 lg:py-24 mx-auto max-w-7xl px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Contact Info & Support Channels */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-md mb-6">
            <Image src="/logo-64.png" alt="Logo" width={16} height={16} />
            <span className="font-mono text-[11px] uppercase tracking-wider">GLOBAL ENTERPRISE SUPPORT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Connect with Our Logistics Team
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Whether you are evaluating automated dispatch for regional hubs or upgrading your transcontinental cold-chain monitoring, our engineers are ready.
          </p>

          <div className="mt-10 space-y-6">
            {/* Office 1 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                HEADQUARTERS & APAC DISPATCH CORE
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Mumbai Central Gateway
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Level 14, Tower B, Bandra Kurla Complex (BKC)<br />
                Mumbai, MH 400051, India
              </p>
              <div className="mt-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                +91 (022) 8800-4200 • contact@agenticlogistics.com
              </div>
            </div>

            {/* 24/7 Dispatch NOC */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                  24/7 INCIDENT & NOC DISPATCH
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Global Operations Center
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Priority telemetry escalation for bonded carriers & active waybill alerts.
              </p>
              <div className="mt-3 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Toll-Free Telemetry NOC: +1 (800) 555-AGNT
              </div>
            </div>

            {/* Existing ERP Login Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Already an active enterprise partner?</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sign into your organization’s role-based console to review manifests, driver manifests, or trigger dispatches.
              </p>
              <div className="mt-4">
                <a
                  href={ERP_URL}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Launch ERP Console</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-lg">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-2xl font-bold mb-4">
                  ✓
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  Inquiry Received
                </h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900 dark:text-white">{formData.name}</strong>. A logistics solutions architect from our enterprise team will reach out to <span className="font-mono text-blue-600">{formData.email}</span> within 4 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    Request an Enterprise Deployment Consultation
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Fill out the parameters below to schedule a demonstration tailored to your operational volume.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel Sterling"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rachel@carriercorp.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Freight"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Active Fleet Size
                    </label>
                    <select
                      value={formData.fleetSize}
                      onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="10-50 vehicles">10 – 50 vehicles</option>
                      <option value="50-250 vehicles">50 – 250 vehicles</option>
                      <option value="250-1000 vehicles">250 – 1,000 vehicles</option>
                      <option value="1000+ vehicles">1,000+ enterprise fleet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Solution Area
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="Autonomous Dispatch">Autonomous Fleet Dispatching</option>
                    <option value="Cold Chain Freight">Cold Chain & Pharma Telemetry</option>
                    <option value="Multi-Modal Intermodal">Multi-Modal Intermodal Switching</option>
                    <option value="Full Enterprise ERP">Full ERP + Telemetry Suite Integration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Operational Requirements / Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your distribution hubs, shipment volume, or integration timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-[0.99]"
                >
                  Submit Enterprise Inquiry →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
