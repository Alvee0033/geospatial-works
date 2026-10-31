'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ApiClient.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery code. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#EAEBEF] rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D1117] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">
            GW
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Recovery</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your registered work email to receive password reset instructions</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Check your inbox</h2>
              <p className="text-xs text-slate-500 mt-1">
                If an account exists for <span className="font-semibold text-slate-700">{email}</span>, a 6-digit OTP code or reset link has been dispatched.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Enter Reset Code</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft size={13} />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee ID / Email</label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@geospatialworks.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#0D1117] text-white rounded-full text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Recovery Code'}</span>
              <ArrowRight size={14} />
            </button>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft size={13} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
