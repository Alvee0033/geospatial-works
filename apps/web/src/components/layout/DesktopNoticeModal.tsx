'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, AlertTriangle, X } from 'lucide-react';

export const DesktopNoticeModal: React.FC = () => {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check userAgent and screen width
      const ua = navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isNarrowScreen = window.innerWidth < 1024;
      setIsMobileOrTablet(isMobileUA || isNarrowScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isMobileOrTablet || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Dismiss notice"
        >
          <X size={18} />
        </button>

        {/* Icons Graphic */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div className="text-slate-300 font-bold">→</div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center">
            <Monitor size={28} />
          </div>
        </div>

        {/* Warning Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold tracking-wide uppercase mb-3">
          <AlertTriangle size={13} className="text-amber-600" />
          <span>Desktop Experience Only</span>
        </div>

        {/* Headline & Body */}
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Notice: Best Viewed on a PC / Desktop Device
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
          The <strong>GW Enterprise Admin Portal</strong> is engineered strictly for desktop workstations and PC displays with large data grids, financial spreadsheets, and ERP controls.
        </p>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Recommended: Open this portal on a laptop or desktop monitor (1280px+).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Mobile users: Please install the official <strong>GW Mobile App (SpendWise Pro)</strong> for mobile attendance and field expense claims.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="w-full py-3 bg-[#0D1117] hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            I Understand, Continue on this Device
          </button>
        </div>
      </div>
    </div>
  );
};
