'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await ApiClient.login({ email, password });
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
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#EAEBEF] rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D1117] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">
            GW
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Geospatial Works</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Management Portal & Admin Control</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{error}</span>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@geospatialworks.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
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
            className="w-full mt-2 py-3 bg-[#0D1117] text-white rounded-full text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-400">Authorized Personnel & Management Access Only</p>
        </div>
      </div>
    </div>
  );
}
