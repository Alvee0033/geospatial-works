'use client';

import { useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';

type LeaveRecord = {
  id: string;
  userId?: string;
  user_id?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  leaveType?: string;
  leave_type?: string;
  status?: string;
  isApproved?: boolean;
  is_approved?: boolean;
};

function daysInMonth(leave: LeaveRecord, month: string) {
  const start = new Date(`${String(leave.startDate || leave.start_date || '').slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(leave.endDate || leave.end_date || '').slice(0, 10)}T00:00:00`);
  const [year, number] = month.split('-').map(Number);
  const first = new Date(year, number - 1, 1);
  const last = new Date(year, number, 0);
  if ([start, end, first, last].some((date) => Number.isNaN(date.getTime()))) return 0;
  return Math.max(0, Math.floor((Math.min(end.getTime(), last.getTime()) - Math.max(start.getTime(), first.getTime())) / 86400000) + 1);
}

export function LeaveHistoryPanel({ leave, leaves, onSelect }: {
  leave: LeaveRecord;
  leaves: LeaveRecord[];
  onSelect: (leave: LeaveRecord) => void;
}) {
  const [month, setMonth] = useState(() => String(leave.startDate || leave.start_date || new Date().toISOString()).slice(0, 7));
  const [showAll, setShowAll] = useState(false);
  const employeeId = String(leave.userId || leave.user_id || '');
  const records = leaves.filter((item) =>
    String(item.userId || item.user_id || '') === employeeId && item.id !== leave.id && daysInMonth(item, month) > 0,
  ).sort((a, b) => String(b.startDate || b.start_date).localeCompare(String(a.startDate || a.start_date)));
  const approvedDays = records.filter((item) =>
    String(item.status || (item.isApproved || item.is_approved ? 'approved' : 'pending')).toLowerCase() === 'approved',
  ).reduce((sum, item) => sum + daysInMonth(item, month), 0);

  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-label="Past leave records">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-sm font-bold text-slate-900">Past Leave Records</h3><p className="mt-0.5 text-xs text-slate-500">Other leave requests from this employee</p></div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">Month
        <input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setShowAll(false); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
      </label>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Requests</p><p className="mt-1 text-xl font-bold text-slate-900">{records.length}</p></div>
      <div className="rounded-xl bg-indigo-50 p-3"><p className="text-[11px] text-indigo-700">Approved days</p><p className="mt-1 text-xl font-bold text-indigo-900">{approvedDays}</p></div>
    </div>
    <div className="mt-3 divide-y divide-slate-100">
      {records.length === 0 && <p className="py-4 text-xs text-slate-500">No other leave records in this month.</p>}
      {(showAll ? records : records.slice(0, 3)).map((item) => <button type="button" key={item.id} onClick={() => onSelect(item)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><CalendarDays size={16} /></span>
        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold capitalize text-slate-900">{item.leaveType || item.leave_type || 'Leave'}</span><span className="block text-[11px] text-slate-500">{String(item.startDate || item.start_date).slice(0, 10)} – {String(item.endDate || item.end_date).slice(0, 10)} · {item.status || (item.isApproved || item.is_approved ? 'Approved' : 'Pending')}</span></span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>)}
    </div>
    {records.length > 3 && <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 text-xs font-bold text-indigo-700 hover:underline">{showAll ? 'Show less' : `View all ${records.length} records`}</button>}
  </section>;
}
