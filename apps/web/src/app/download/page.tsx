'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  MapPin, 
  Receipt, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface ReleaseInfo {
  versionName: string;
  buildNumber: number;
  releaseNotes?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
  createdAt?: string;
}

export default function DownloadPage() {
  const [release, setRelease] = useState<ReleaseInfo>({
    versionName: 'v1.0.0',
    buildNumber: 1,
    releaseNotes: 'Production-ready field intelligence app with geofenced attendance, receipts capture, and real-time project chat.',
    downloadUrl: '/api/v1/app-releases/download-latest',
    fileSizeBytes: 28500000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getLatestAppRelease()
      .then((data) => {
        if (data && data.versionName) {
          setRelease(data);
        }
      })
      .catch(() => {
        // Fallback to default release
      })
      .finally(() => setLoading(false));
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '28.5 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#0D1117] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            GW
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight block text-sm">Geospatial Works</span>
            <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-semibold">Mobile App Releases</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-white bg-[#0D1117] hover:bg-slate-800 px-3.5 py-2 rounded-lg transition-all shadow-xs"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="w-full max-w-4xl mx-auto px-6 py-10 flex-1 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles size={14} className="text-blue-600" />
          <span>Latest Android Release Available</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span>{release.versionName}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-2xl leading-tight">
          Enterprise Field Intelligence on Your Mobile Device
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-4 max-w-xl leading-relaxed">
          The official Geospatial Works mobile application empowers field survey teams with geofenced attendance, instant expense submission, and direct collaboration.
        </p>

        {/* Download Action Card */}
        <div className="w-full max-w-lg mt-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-xs">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Geospatial Works Mobile</h3>
                <p className="text-xs text-slate-400 mt-0.5">Android APK Package</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/60">
                {release.versionName}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">{formatSize(release.fileSizeBytes)}</p>
            </div>
          </div>

          <div className="py-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Release Notes</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {release.releaseNotes || 'Production build with improved geofence verification, instant receipts, and attendance clock-in.'}
            </p>
          </div>

          {/* Download Button */}
          <div className="pt-2 space-y-3">
            <a
              href="/api/v1/app-releases/download-latest"
              download
              className="w-full py-3.5 bg-[#0D1117] text-white rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
            >
              <Download size={18} />
              <span>Download APK ({formatSize(release.fileSizeBytes)})</span>
            </a>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed">
              <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <strong>Employee Notice:</strong> You can download and install the app now, but an approved employee account is required to sign in.
              </div>
            </div>
          </div>

          {/* Registration CTA inside Card */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need an account?</span>
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>Register for App Access</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-12 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <MapPin size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Geofenced Attendance</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Automated GPS boundary validation for on-site check-in and check-out with zero fraud.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Receipt size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Expense Submissions</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Instant camera receipt capture, category selection, and automated budget accounting.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <MessageSquare size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Real-time Project Chat</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Direct and channel messaging with attachment support between field surveyors and HQ.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <p>&copy; {new Date().getFullYear()} Geospatial Works Ltd. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-slate-600">Web Portal</Link>
          <Link href="/register" className="hover:text-slate-600">Employee Registration</Link>
          <span className="text-slate-300">|</span>
          <span>Security Verified</span>
        </div>
      </footer>
    </div>
  );
}
