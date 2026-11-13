'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await ApiClient.login({ email: email.trim(), password });
      const token = res.accessToken || res.token;
      if (token) {
        ApiClient.setToken(token);
        if (res.user) {
          localStorage.setItem('gw_user', JSON.stringify(res.user));
        }
        router.push('/dashboard');
      } else {
        throw new Error('No access token returned from server');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#EAEBEF] rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-3 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Geospatial Works Logo"
              width={64}
              height={64}
              priority
              className="h-16 w-16 object-contain rounded-2xl shadow-xs"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Geospatial Works</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Management Portal & Admin Control</p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className={`mb-5 rounded-xl border px-3.5 py-3 text-sm leading-5 flex items-start gap-2.5 ${
              error.toLowerCase().includes('pending')
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            <ShieldCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{error.toLowerCase().includes('pending') ? 'Verification Required' : 'Authentication Error'}</p>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee ID / Email</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoComplete="username"
                aria-label="Employee ID or email"
                placeholder="Employee ID or name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
                aria-label="Password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900 focus:ring-0" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-slate-600 hover:text-slate-900 font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#0D1117] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:cursor-wait disabled:opacity-60"
          >
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>

        <div className="mt-5 text-center border-t border-slate-100 pt-4 text-xs text-slate-500">
          New employee?{' '}
          <Link href="/register" className="font-bold text-slate-900 hover:underline">
            Register for employee account
          </Link>
        </div>
      </div>
    </div>
  );
}
