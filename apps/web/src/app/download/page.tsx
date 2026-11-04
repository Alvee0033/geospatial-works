'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { 
  Download, 
  Smartphone, 
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  LogOut,
  CheckCircle2
} from 'lucide-react';

interface ReleaseInfo {
  versionName: string;
  buildNumber: number;
  releaseNotes?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
}

interface CurrentUser {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export default function DownloadPage() {
  const [release, setRelease] = useState<ReleaseInfo>({
    versionName: 'v1.0.0',
    buildNumber: 1,
    fileSizeBytes: 28500000,
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const triggerDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = '/api/v1/app-releases/download-latest';
    link.download = 'geospatial-works.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
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
      .catch(() => {});
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
        // Auto-trigger direct APK download upon successful sign-in
        setTimeout(() => {
          triggerDownload();
        }, 300);
      } else {
        throw new Error('Authentication failed: no token returned.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials.';
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
    setDownloadStarted(false);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '28.5 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Clean Minimal Header */}
      <header className="w-full max-w-md mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            GW
          </div>
          <span className="font-bold text-sm tracking-tight">Geospatial Works</span>
        </div>

        {currentUser && (
          <button
            onClick={handleSignOut}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          {/* App Header */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Smartphone size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-base font-bold text-slate-900 truncate">GW Mobile App</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {release.versionName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Android APK • {formatSize(release.fileSizeBytes)}</p>
            </div>
          </div>

          {/* AUTHENTICATION GATE */}
          {currentUser ? (
            /* Logged In View */
            <div className="pt-5 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                <UserCheck size={16} className="text-emerald-700 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{currentUser.full_name || currentUser.email}</p>
                  <p className="text-[11px] text-emerald-700">Account verified</p>
                </div>
              </div>

              {downloadStarted && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800">
                  <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                  <span>Download started automatically.</span>
                </div>
              )}

              <button
                onClick={triggerDownload}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                <Download size={16} />
                <span>Download APK ({formatSize(release.fileSizeBytes)})</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Tap to install on any Android smartphone.
              </p>
            </div>
          ) : (
            /* Sign In Step */
            <div className="pt-5 space-y-4">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sign in to download</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your employee credentials to start the download.
                </p>
              </div>

              {authError && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  isPendingApproval 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <AlertCircle size={16} className={`shrink-0 mt-0.5 ${isPendingApproval ? 'text-amber-700' : 'text-rose-600'}`} />
                  <div>
                    <strong className="block font-semibold">
                      {isPendingApproval ? 'Account Pending Approval' : 'Sign In Error'}
                    </strong>
                    <span className="text-[11px] opacity-90">{authError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                  <div className="relative flex items-center">
                    <Mail size={14} className="absolute left-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-60 disabled:cursor-wait"
                >
                  <span>{loadingAuth ? 'Signing in…' : 'Sign In & Download'}</span>
                  <ArrowRight size={13} />
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100 text-xs text-slate-500">
                New employee?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                  Create account
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="w-full max-w-md mx-auto px-4 py-5 text-center text-[11px] text-slate-400">
        <p>&copy; {new Date().getFullYear()} Geospatial Works Ltd.</p>
      </footer>
    </div>
  );
}

