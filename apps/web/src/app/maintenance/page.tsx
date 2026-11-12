'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Clock, ShieldAlert, Wrench, Server } from 'lucide-react';

export default function MaintenancePage() {
  // Target: Tonight midnight (2026-11-14 00:00:00 BST GMT+6 / ~22 hours from now)
  const targetDate = new Date('2026-11-14T00:00:00+06:00').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 22, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="min-h-screen bg-[#070B11] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-2 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Image
              src="/logo.png"
              alt="Geospatial Works Logo"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
              Geospatial Works Ltd.
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                HQ Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Geospatial Platform & Survey Operations</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Scheduled System Upgrade
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-6 py-6 relative z-10 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Wrench className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          System Maintenance & Performance Overhaul
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.15] mb-5">
          We are upgrading the{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Admin Management Portal
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300/90 max-w-2xl leading-relaxed mb-10 font-normal">
          Our core infrastructure is undergoing scheduled system enhancements, field database optimizations, and security patches to deliver an upgraded, seamless experience.
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl mb-10">
          {[
            { label: 'DAYS', value: timeLeft.days },
            { label: 'HOURS', value: timeLeft.hours },
            { label: 'MINUTES', value: timeLeft.minutes },
            { label: 'SECONDS', value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-xl backdrop-blur-xl relative group hover:border-emerald-500/40 transition-colors"
            >
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <span className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-mono">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider mt-1 sm:mt-2">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Info Pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-6 py-3.5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Target Reopening: <strong className="text-slate-200">Today, 12:00 AM Midnight (BST)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Operations & Sync: <strong className="text-emerald-400">Safely Preserved</strong></span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <p>© 2026 Geospatial Works Ltd. All rights reserved.</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
          <span>Security Hardened Infrastructure • TLS 1.3 Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
