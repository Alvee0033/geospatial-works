'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { Lock, Mail, User, Building2, Briefcase, Phone, ArrowRight, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      await ApiClient.register({
        name: name.trim(),
        email: email.trim(),
        password,
        department: department.trim() || undefined,
        designation: designation.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-lg bg-white border border-[#EAEBEF] rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D1117] flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">
            GW
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Geospatial Works</h1>
          <p className="text-xs text-slate-500 mt-1">Employee Account Registration & App Access</p>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registration Submitted!</h2>
              <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">Awaiting Administrator Approval</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs text-slate-600 space-y-2.5">
              <p>
                Hello <strong>{name}</strong>, your employee account for <strong>{email}</strong> has been created.
              </p>
              <p className="leading-relaxed">
                For security compliance, employee accounts require administrator verification before access is granted. An alert has been dispatched to system administrators.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 font-medium">
                📩 Once approved, you will receive an official confirmation email containing your direct Mobile App download link and login access.
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Go to Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700 flex items-start gap-2.5">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Work Email *</label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password *</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={3}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 3 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                  <div className="relative flex items-center">
                    <Building2 size={15} className="absolute left-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. GIS & Survey"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
                  <div className="relative flex items-center">
                    <Briefcase size={15} className="absolute left-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Field Surveyor"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-[#EAEBEF] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ <strong>Approval Notice:</strong> Accounts are registered with pending status. An administrator must approve your account before you can log in to the mobile app or dashboard.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0D1117] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:cursor-wait disabled:opacity-60"
              >
                <span>{loading ? 'Submitting registration…' : 'Submit Account Registration'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 text-center border-t border-slate-100 pt-4 text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
