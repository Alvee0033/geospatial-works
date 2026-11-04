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
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface ReleaseInfo {
  versionName: string;
  buildNumber: number;
  releaseNotes?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
  createdAt?: string;
}

interface CurrentUser {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}

export default function DownloadPage() {
  const [release, setRelease] = useState<ReleaseInfo>({
    versionName: 'v1.0.0',
    buildNumber: 1,
    releaseNotes: 'Production-ready enterprise survey & attendance application.',
    downloadUrl: '/api/v1/app-releases/download-latest',
    fileSizeBytes: 28500000,
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const token = ApiClient.getToken();
    const storedUser = localStorage.getItem('gw_user');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch {
        // ignore
      }
    }

    ApiClient.getLatestAppRelease()
      .then((data) => {
        if (data && data.versionName) {
          setRelease(data);
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAuth) return;
    setLoadingAuth(true);
    setAuthError(null);
    setIsPendingApproval(false);

    try {
      const res = await ApiClient.login({ email: email.trim(), password });
      const token = res.accessToken || res.token;
      if (token) {
        ApiClient.setToken(token);
        if (res.user) {
          localStorage.setItem('gw_user', JSON.stringify(res.user));
          setCurrentUser(res.user);
        }
      } else {
        throw new Error('Authentication failed: no token returned.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('approval') || msg.toLowerCase().includes('activate')) {
        setIsPendingApproval(true);
        setAuthError(msg);
      } else {
        setAuthError(msg);
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignOut = () => {
    ApiClient.clearToken();
    setCurrentUser(null);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '28.5 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
            GW
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm tracking-tight block leading-tight">Geospatial Works</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">App Distribution</span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900">{currentUser.full_name || currentUser.email}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Verified Active</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/register"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:bg-white transition-colors"
            >
              Register
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-800 text-[11px] font-semibold mb-5 shadow-2xs">
          <Sparkles size={12} className="text-blue-600" />
          <span>Android Production Build</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-blue-600 font-mono">{release.versionName}</span>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Geospatial Works Mobile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Direct installation package for field surveyors, project engineers, and on-site staff.
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          {/* Release Meta Snippet */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
                <Smartphone size={22} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">APK Distribution</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Build #{release.buildNumber} • {formatSize(release.fileSizeBytes)}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
              Verified
            </span>
          </div>

          {/* Release Notes */}
          <div className="py-3.5 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What&apos;s New</p>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100/80">
              {release.releaseNotes || 'Production build with geofence verification, instant receipts, and attendance clock-in.'}
            </p>
          </div>

          {/* AUTHENTICATION GATE */}
          {currentUser ? (
            /* Authenticated: Direct Download */
            <div className="pt-4 space-y-3">
              <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-950 truncate">{currentUser.full_name || currentUser.email}</p>
                  <p className="text-[10px] text-emerald-700 font-medium capitalize">
                    {currentUser.role?.replace(/_/g, ' ') || 'Employee'} • Authorized for Mobile Deployment
                  </p>
                </div>
              </div>

              <a
                href="/api/v1/app-releases/download-latest"
                download="geospatial-works.apk"
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                <Download size={16} />
                <span>Download APK ({formatSize(release.fileSizeBytes)})</span>
              </a>

              <p className="text-[11px] text-center text-slate-400">
                Direct installation file (.apk) for Android devices.
              </p>
            </div>
          ) : (
            /* Not Authenticated: Sign In Required */
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock size={14} className="text-slate-700" />
                    <span>Employee Sign In Required</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sign in to verify your employee profile before downloading.
                  </p>
                </div>
              </div>

              {/* Pending Approval / Error Notice */}
              {authError && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  isPendingApproval 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <AlertCircle size={16} className={`shrink-0 mt-0.5 ${isPendingApproval ? 'text-amber-700' : 'text-rose-600'}`} />
                  <div>
                    <strong className="block font-semibold">
                      {isPendingApproval ? 'Approval Pending' : 'Authentication Error'}
                    </strong>
                    <span className="text-[11px] opacity-90">{authError}</span>
                    {isPendingApproval && (
                      <p className="text-[10px] text-amber-700 mt-1 font-medium">
                        Your account has not been approved by an administrator yet. You will be able to sign in and download the app once an admin activates your account.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Compact Login Form */}
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employee Email</label>
                  <div className="relative flex items-center">
                    <Mail size={14} className="absolute left-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={14} className="absolute left-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-60 disabled:cursor-wait"
                >
                  <span>{loadingAuth ? 'Verifying Profile…' : 'Sign In to Unlock Download'}</span>
                  <ArrowRight size={13} />
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-500">
                Don&apos;t have an employee account?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Register here
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-8 text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
              <MapPin size={16} />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">GPS Geofencing</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Automated boundary validation ensures accurate on-site check-in.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <Receipt size={16} />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Field Receipts</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Snap receipts in real-time with instant project expense categorization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-2.5">
              <MessageSquare size={16} />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Project Chat</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Direct and channel messaging with sync between field and headquarters.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto px-4 py-6 border-t border-slate-200/60 text-center text-[11px] text-slate-400">
        <p>&copy; {new Date().getFullYear()} Geospatial Works Ltd. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link href="/login" className="hover:text-slate-600">Admin Portal</Link>
          <span>•</span>
          <Link href="/register" className="hover:text-slate-600">Register</Link>
          <span>•</span>
          <span className="text-slate-500">Security Gate Protected</span>
        </div>
      </footer>
    </div>
  );
}

