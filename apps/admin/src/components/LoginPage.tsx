'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  KeyRound,
  Server,
  Layers,
  Cpu,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: { id: string; email: string; name: string; role: string }) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('admin@geospatialworks.com.bd');
  const [password, setPassword] = useState('Admin@2026!GW');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Invalid credentials. Please verify your email and password.');
      }

      if (data.accessToken && data.user) {
        if (rememberMe) {
          localStorage.setItem('gw_admin_jwt', data.accessToken);
          localStorage.setItem('gw_admin_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('gw_admin_jwt', data.accessToken);
          sessionStorage.setItem('gw_admin_user', JSON.stringify(data.user));
        }
        onLoginSuccess(data.accessToken, data.user);
      } else {
        throw new Error('Authentication response invalid: missing access token.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'editor') => {
    if (role === 'admin') {
      setEmail('admin@geospatialworks.com.bd');
      setPassword('Admin@2026!GW');
    } else {
      setEmail('surveyor@geospatialworks.com.bd');
      setPassword('Surveyor2026!Safe');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#070d18] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Radiant Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Banner */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            GW
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Geospatial Works Ltd.</h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Security &amp; Control Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SSL 256-bit Encrypted Node</span>
        </div>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Outer Glass Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60 relative">
            {/* Top Security Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                <ShieldCheck size={28} className="text-indigo-400" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Admin &amp; Staff Authentication</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Sign in with verified credentials to manage geospatial infrastructure, survey datasets &amp; operations
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <ShieldAlert size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email or Access ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@geospatialworks.com.bd"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Encrypted Password
                  </label>
                  <span className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer">
                    BCrypt-12 Salted
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span>Keep session active across reloads</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying Security Token...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Control Center</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill Demo Badges */}
            <div className="mt-7 pt-5 border-t border-white/10">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Quick Fill Credentials:</span>
                <span className="text-[10px] text-slate-500">Demo Testing</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-medium text-slate-300 text-left transition cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-indigo-400">Admin Account</span>
                  <span className="text-[10px] text-slate-400 truncate">admin@geospatialworks.com.bd</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('editor')}
                  className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-medium text-slate-300 text-left transition cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-blue-400">Editor Account</span>
                  <span className="text-[10px] text-slate-400 truncate">surveyor@geospatialworks.com.bd</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Features Below */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5">
              <KeyRound size={16} className="text-indigo-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white">BCrypt Hashing</div>
              <div className="text-[9px] text-slate-400">12 Salt Rounds</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5">
              <Server size={16} className="text-blue-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white">PostgreSQL DB</div>
              <div className="text-[9px] text-slate-400">Row-level Auth</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5">
              <ShieldCheck size={16} className="text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-white">RBAC Guard</div>
              <div className="text-[9px] text-slate-400">Admin / Editor / Viewer</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-white/5 text-center text-xs text-slate-500 bg-slate-950/60 backdrop-blur-md">
        © 2026 Geospatial Works Ltd. All rights reserved. Precision Geodesy, Hydrography &amp; Infrastructure Portal.
      </footer>
    </div>
  );
}
