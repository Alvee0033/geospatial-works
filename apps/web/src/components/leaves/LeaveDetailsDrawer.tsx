'use client';

import React from 'react';
import { CalendarDays, Check, Clock3, MessageSquareText, Trash2, UserRound, X } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

type LeaveDetailsDrawerProps = {
  leave: any;
  employeeName: string;
  avatarUrl?: string | null;
  email?: string | null;
  department?: string | null;
  status: string;
  canReview?: boolean;
  canDelete?: boolean;
  busy?: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  onDelete?: () => void;
};

function displayDate(value?: string | null, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, options);
}

export function LeaveDetailsDrawer({
  leave,
  employeeName,
  avatarUrl,
  email,
  department,
  status,
  canReview = false,
  canDelete = false,
  busy = false,
  onClose,
  onApprove,
  onDecline,
  onDelete,
}: LeaveDetailsDrawerProps) {
  const startDate = leave.startDate || leave.start_date;
  const endDate = leave.endDate || leave.end_date || startDate;
  const rawDays = Number(leave.days ?? leave.totalDays ?? leave.total_days);
  const calculatedDays = startDate && endDate
    ? Math.max(1, Math.round((new Date(`${String(endDate).slice(0, 10)}T00:00:00`).getTime() - new Date(`${String(startDate).slice(0, 10)}T00:00:00`).getTime()) / 86400000) + 1)
    : 1;
  const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : calculatedDays;
  const statusTone = status === 'approved'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : status === 'rejected'
      ? 'bg-rose-50 text-rose-700 ring-rose-200'
      : 'bg-amber-50 text-amber-700 ring-amber-200';

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="leave-details-title" className="absolute inset-y-0 right-0 flex w-full max-w-[500px] flex-col border-l border-slate-200 bg-[#fbfcfe] shadow-2xl animate-in slide-in-from-right duration-200">
        <header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar src={avatarUrl} name={employeeName} size="lg" shape="rounded" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Leave request</p>
              <h2 id="leave-details-title" className="mt-0.5 truncate text-lg font-semibold text-slate-900">{employeeName}</h2>
              <p className="mt-0.5 truncate text-xs text-slate-500">{[department, email].filter(Boolean).join(' · ') || 'Employee'}</p>
            </div>
          </div>
          <button type="button" aria-label="Close leave details" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Requested leave</p>
                <p className="mt-1 text-xl font-semibold capitalize tracking-tight text-slate-900">{leave.leaveType || leave.leave_type || leave.type || 'Leave'}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusTone}`}>
                {status === 'approved' ? <Check size={13} /> : <Clock3 size={13} />}
                {status === 'rejected' ? 'Declined' : status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div><p className="text-[11px] font-medium text-slate-400">First day</p><p className="mt-1 text-sm font-semibold text-slate-800">{displayDate(startDate)}</p></div>
              <div><p className="text-[11px] font-medium text-slate-400">Last day</p><p className="mt-1 text-sm font-semibold text-slate-800">{displayDate(endDate)}</p></div>
              <div className="col-span-2 rounded-xl bg-indigo-50/70 px-3 py-2.5"><p className="text-[11px] text-indigo-600">Duration</p><p className="mt-0.5 text-sm font-semibold text-indigo-900">{days} {days === 1 ? 'day' : 'days'}</p></div>
            </div>
          </section>

          <section>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Request details</h3>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
              <div className="flex items-center gap-3 py-3.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><UserRound size={16} /></span><div><p className="text-[11px] text-slate-400">Employee</p><p className="text-sm font-medium text-slate-800">{employeeName}</p></div></div>
              <div className="flex items-center gap-3 py-3.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-700"><CalendarDays size={16} /></span><div><p className="text-[11px] text-slate-400">Submitted</p><p className="text-sm font-medium text-slate-800">{displayDate(leave.createdAt || leave.created_at, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p></div></div>
              <div className="py-3.5"><p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><MessageSquareText size={13} /> Reason</p><p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{leave.reason || leave.note || 'No reason was provided.'}</p></div>
              {(leave.approvalNote || leave.approval_note || leave.reviewNote || leave.review_note) && <div className="py-3.5"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Review note</p><p className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-slate-700">{leave.approvalNote || leave.approval_note || leave.reviewNote || leave.review_note}</p></div>}
            </div>
          </section>
        </div>

        {(canReview && status === 'pending' || canDelete) && <footer className="flex items-center gap-2 border-t border-slate-200 bg-white px-6 py-4">
          {canDelete && <button type="button" onClick={onDelete} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"><Trash2 size={15} /> Remove</button>}
          {canReview && status === 'pending' && <>
            <button type="button" onClick={onDecline} disabled={busy} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">Decline</button>
            <button type="button" onClick={onApprove} disabled={busy} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Check size={16} /> Approve leave</button>
          </>}
        </footer>}
      </aside>
    </div>
  );
}
