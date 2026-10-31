'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, KeyRound, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await ApiClient.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your OTP code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#EAEBEF] rounded-[32px] p-8 shadow-sm">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0D1117] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">
          GW
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create New Password</h1>
        <p className="text-xs text-slate-500 mt-1">Enter your verification code and set your new credentials</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <ShieldCheck size={16} />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Password Reset Successful!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your password has been securely updated. Redirecting you to login...
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>Go to Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Verification Code (OTP)</label>
            <div className="relative flex items-center">
              <KeyRound size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 123456"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-full text-xs tracking-widest font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#0D1117] text-white rounded-full text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading reset session...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
