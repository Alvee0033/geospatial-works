'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api';
import { 
  Download, 
  Smartphone, 
  ArrowRight, 
  Lock, 
  Mail, 
  UserCheck, 
  AlertCircle, 
  LogOut, 
  CheckCircle2, 
  KeyRound, 
  DownloadCloud, 
  CheckCheck,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

interface ReleaseInfo {
  id?: string;
  versionName: string;
  buildNumber: number;
  downloadUrl?: string;
  fileSizeBytes?: number;
  releaseNotes?: string;
  createdAt?: string;
  isLatest?: boolean;
}

interface CurrentUser {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

const BACKEND_DIRECT_DOWNLOAD = 'https://ihhxbfmr3be3hilklfuvhwyg.203.96.190.78.sslip.io/api/v1/app-releases/download-latest';
const BACKEND_DIRECT_LATEST = 'https://ihhxbfmr3be3hilklfuvhwyg.203.96.190.78.sslip.io/api/v1/app-releases/latest';
const BACKEND_DIRECT_RELEASES = 'https://ihhxbfmr3be3hilklfuvhwyg.203.96.190.78.sslip.io/api/v1/app-releases';

export default function DownloadPage() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [loadingRelease, setLoadingRelease] = useState(true);
  const [allReleases, setAllReleases] = useState<ReleaseInfo[]>([]);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const getDirectDownloadUrl = (targetRelease?: ReleaseInfo | null): string => {
    const rel = targetRelease || release;
    if (rel?.downloadUrl && rel.downloadUrl.startsWith('http')) {
      return rel.downloadUrl;
    }
    return BACKEND_DIRECT_DOWNLOAD;
  };

  const triggerDownload = (targetRelease?: ReleaseInfo | null) => {
    setDownloadStarted(true);
    const url = getDirectDownloadUrl(targetRelease);
    window.location.assign(url);
  };

  const fetchReleases = async () => {
    setLoadingRelease(true);
    let latestData: ReleaseInfo | null = null;

    try {
      const data = await ApiClient.getLatestAppRelease();
      if (data && data.versionName) {
        latestData = data;
      }
    } catch {
      // fallback
    }

    if (!latestData) {
      try {
        const res = await fetch(BACKEND_DIRECT_LATEST);
        if (res.ok) {
          const data = await res.json();
          if (data && data.versionName) {
            latestData = data;
          }
        }
      } catch (e) {
        console.error('Error fetching latest release directly:', e);
      }
    }

    if (latestData) {
      setRelease(latestData);
    }
    setLoadingRelease(false);

    try {
      const history = await ApiClient.getAppReleases();
      if (Array.isArray(history) && history.length > 0) {
        setAllReleases(history);
        return;
      }
    } catch {
      // fallback
    }

    try {
      const res = await fetch(BACKEND_DIRECT_RELEASES);
      if (res.ok) {
        const history = await res.json();
        if (Array.isArray(history) && history.length > 0) {
          setAllReleases(history);
        }
      }
    } catch {
      // ignore
    }
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

    fetchReleases();

    // Prevent browser from showing PWA / Chrome web app install banner
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      return false;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
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
        // Auto-trigger direct APK download upon successful verified sign-in
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
    if (!bytes || bytes <= 0) return '74.5 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentStep = currentUser ? (downloadStarted ? 3 : 2) : 1;
  const activeVersion = release?.versionName || 'v1.0.9';
  const activeSize = formatSize(release?.fileSizeBytes);
  const directUrl = getDirectDownloadUrl();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Top Bar */}
      <header className="w-full max-w-lg mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
            GW
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block text-slate-900 leading-tight">Geospatial Works</span>
            <span className="text-[11px] text-slate-500 font-medium">Official Mobile Distribution</span>
          </div>
        </div>

        {currentUser && (
          <button
            onClick={handleSignOut}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-200/70 transition-all border border-slate-200/80 bg-white shadow-2xs"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        {/* Step Progress Header */}
        <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 mb-3.5 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-xs ${
                currentStep >= 1 
                  ? 'bg-slate-900 text-white shadow-slate-900/20' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {currentUser ? <CheckCheck size={18} /> : <KeyRound size={18} />}
              </div>
              <span className="text-[11px] font-bold mt-1.5 text-slate-800">1. Sign In</span>
              <span className="text-[10px] text-slate-400">{currentUser ? 'Verified' : 'Required'}</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-xs ${
                currentStep >= 2 
                  ? 'bg-blue-600 text-white shadow-blue-600/20' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <DownloadCloud size={18} />
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${currentStep >= 2 ? 'text-blue-700' : 'text-slate-400'}`}>
                2. Download
              </span>
              <span className="text-[10px] text-slate-400">{currentStep >= 2 ? 'Unlocked' : 'Locked'}</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-xs ${
                currentStep >= 3 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <Smartphone size={18} />
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${currentStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                3. Install
              </span>
              <span className="text-[10px] text-slate-400">Android Device</span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          {/* App Header Snippet */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-md shrink-0">
              <Smartphone size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-extrabold text-slate-900 truncate">GW Mobile App</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                  {loadingRelease && <RefreshCw size={10} className="animate-spin" />}
                  {activeVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Android Package • {activeSize}
                {release?.buildNumber ? ` • Build #${release.buildNumber}` : ''}
              </p>
            </div>
          </div>

          {/* MANDATORY AUTHENTICATION GATE */}
          {currentUser ? (
            /* STEP 2 & 3: UNLOCKED FOR SIGNED IN USERS ONLY */
            <div className="pt-5 space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UserCheck size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{currentUser.full_name || currentUser.email}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                    {currentUser.role === 'admin' || currentUser.role === 'main_admin' ? 'Administrator Verified' : 'Account Verified'} • Download Unlocked
                  </p>
                </div>
              </div>

              {downloadStarted && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900 font-medium">
                  <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                  <span>APK package download is active! Check your notification panel or Downloads.</span>
                </div>
              )}

              {/* DIRECT APK DOWNLOAD BUTTON */}
              <a
                href={directUrl}
                download={`geospatial-works-${activeVersion}.apk`}
                onClick={() => setDownloadStarted(true)}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] text-center"
              >
                <Download size={22} className="stroke-[2.5]" />
                <span>Download APK ({activeSize})</span>
              </a>

              {/* INSTALLATION STEPS */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">Quick Installation Steps:</p>
                <p>1. Tap the <strong>Download APK</strong> button above.</p>
                <p>2. Open your notification panel or Downloads folder and tap the file.</p>
                <p>3. Allow installation from your browser if prompted, then open the app.</p>
                <p>4. Sign in with your work email and password.</p>
              </div>

              {/* Version History */}
              {allReleases.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Version History</span>
                    <span className="text-[10px] text-slate-400">{allReleases.length} releases</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {allReleases.map((r) => (
                      <div
                        key={r.id || r.versionName}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-white text-xs hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono">{r.versionName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">#{r.buildNumber}</span>
                            {r.isLatest && (
                              <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{r.releaseNotes || 'Update'}</p>
                        </div>
                        <a
                          href={r.downloadUrl && r.downloadUrl.startsWith('http') ? r.downloadUrl : BACKEND_DIRECT_DOWNLOAD}
                          download={`geospatial-works-${r.versionName}.apk`}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors"
                        >
                          <Download size={12} />
                          <span>{formatSize(r.fileSizeBytes)}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 1: MANDATORY SIGN IN — NO DOWNLOAD ACCESS WITHOUT SIGNING IN */
            <div className="pt-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={16} className="text-slate-800" />
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Step 1: Sign in to Access Download
                  </h2>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authentication is required. Sign in with your work or administrator account to download the official mobile app.
                </p>
              </div>

              {authError && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
                  isPendingApproval 
                    ? 'bg-amber-50 border-amber-200 text-amber-950' 
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <AlertCircle size={18} className={`shrink-0 mt-0.5 ${isPendingApproval ? 'text-amber-700' : 'text-rose-600'}`} />
                  <div>
                    <strong className="block font-bold text-sm">
                      {isPendingApproval ? 'Account Pending Approval' : 'Sign In Error'}
                    </strong>
                    <span className="text-xs opacity-90 mt-0.5 block">{authError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                >
                  <span>{loadingAuth ? 'Verifying Account…' : 'Sign In & Download App'}</span>
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100 text-xs text-slate-500">
                Need an account? Contact your supervisor or administrator.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="w-full max-w-lg mx-auto px-4 py-5 text-center text-xs text-slate-400 font-medium">
        <p>&copy; {new Date().getFullYear()} Geospatial Works Ltd.</p>
      </footer>
    </div>
  );
}
