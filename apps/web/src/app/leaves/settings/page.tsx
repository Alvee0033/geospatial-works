'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, Search, Settings2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';

const leaveTypes = ['casual', 'sick', 'emergency', 'paid', 'unpaid', 'maternity'];
const leaveTypeStyles: Record<string, { icon: string; text: string; track: string; bar: string; border: string }> = {
  casual: { icon: 'bg-blue-100 text-blue-700', text: 'text-blue-800', track: 'bg-blue-100', bar: 'bg-blue-600', border: 'border-blue-200' },
  sick: { icon: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-800', track: 'bg-emerald-100', bar: 'bg-emerald-600', border: 'border-emerald-200' },
  emergency: { icon: 'bg-amber-100 text-amber-700', text: 'text-amber-800', track: 'bg-amber-100', bar: 'bg-amber-500', border: 'border-amber-200' },
  paid: { icon: 'bg-violet-100 text-violet-700', text: 'text-violet-800', track: 'bg-violet-100', bar: 'bg-violet-600', border: 'border-violet-200' },
  unpaid: { icon: 'bg-slate-100 text-slate-700', text: 'text-slate-800', track: 'bg-slate-100', bar: 'bg-slate-500', border: 'border-slate-200' },
  maternity: { icon: 'bg-pink-100 text-pink-700', text: 'text-pink-800', track: 'bg-pink-100', bar: 'bg-pink-600', border: 'border-pink-200' },
};
type Allowance = { userId: string; year: number; leaveType: string; allowedDays: number };
type Employee = { id: string; name?: string; full_name?: string; department?: string; isActive?: boolean; is_active?: boolean };

function usedInYear(leaves: any[], userId: string, type: string, year: number) {
  const first = new Date(year, 0, 1).getTime();
  const last = new Date(year, 11, 31).getTime();
  return leaves.filter((leave) => leave.userId === userId && leave.leaveType === type &&
    String(leave.status || (leave.isApproved ? 'approved' : 'pending')).toLowerCase() === 'approved')
    .reduce((sum, leave) => {
      const start = new Date(`${String(leave.startDate).slice(0, 10)}T00:00:00`).getTime();
      const end = new Date(`${String(leave.endDate).slice(0, 10)}T00:00:00`).getTime();
      return sum + (Number.isNaN(start) || Number.isNaN(end) ? 0 : Math.max(0, Math.floor((Math.min(end, last) - Math.max(start, first)) / 86400000) + 1));
    }, 0);
}

export default function LeaveSettingsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [users, setUsers] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [employeeId, setEmployeeId] = useState('all');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState('');

  useEffect(() => {
    try { setRole(JSON.parse(localStorage.getItem('gw_user') || '{}').role || ''); } catch { setRole(''); }
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([ApiClient.getUsers(), ApiClient.getLeaves(), ApiClient.getLeaveAllowances(year)])
      .then(([people, records, limits]) => { if (live) { setUsers(people || []); setLeaves(records || []); setAllowances(limits || []); setError(''); } })
      .catch(() => { if (live) setError('Leave allowances could not be loaded. Please retry.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [year, reload]);

  const filtered = useMemo(() => users.filter((person) =>
    (person.isActive ?? person.is_active ?? true) && (employeeId === 'all' || person.id === employeeId) &&
    `${person.name || person.full_name || ''} ${person.department || ''}`.toLowerCase().includes(search.toLowerCase()),
  ).sort((a, b) => String(a.name || a.full_name).localeCompare(String(b.name || b.full_name))), [users, employeeId, search]);

  const save = async (userId: string, leaveType: string, value: string) => {
    const allowedDays = Number(value);
    if (!Number.isInteger(allowedDays) || allowedDays < 0 || allowedDays > 366) {
      notifyAction('Enter a whole number from 0 to 366.', 'error');
      return;
    }
    const key = `${userId}:${leaveType}`;
    setSaving(key);
    try {
      const saved = await ApiClient.setLeaveAllowance({ userId, year, leaveType, allowedDays });
      setAllowances((previous) => [...previous.filter((item) => item.userId !== userId || item.leaveType !== leaveType), saved]);
      notifyAction('Leave allowance saved.');
    } catch (cause: any) {
      notifyAction(`Could not save allowance: ${cause.message}`, 'error');
    } finally { setSaving(''); }
  };

  return <AdminLayout title="Leave Settings" subtitle="Manage yearly leave allowances for each employee.">
    <div className="mb-4 flex items-center gap-2"><Link href="/leaves" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><ArrowLeft size={16} /> Leave Management</Link></div>
    {role && !['main_admin', 'finance_manager'].includes(role) ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Only super admins and finance managers can change leave allowances.</div> : <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-slate-800"><Settings2 size={18} className="text-indigo-600" /><h2 className="text-sm font-bold">Allowance filters</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-slate-600">Year<input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
          <label className="text-xs font-semibold text-slate-600">Employee<select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="all">All employees</option>{users.map((person) => <option key={person.id} value={person.id}>{person.name || person.full_name}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Leave type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="all">All types</option>{leaveTypes.map((item) => <option key={item} value={item} className="capitalize">{item}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Search<span className="mt-1 flex items-center rounded-lg border border-slate-200 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or department" className="w-full px-2 py-2 outline-none" /></span></label>
        </div>
      </div>
      {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">{error}<button type="button" onClick={() => setReload((value) => value + 1)} className="ml-2 underline">Retry</button></div>}
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading allowances…</p> : filtered.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No employees match these filters.</p> : <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {filtered.map((person) => {
          const expanded = expandedEmployeeId === person.id;
          const configured = allowances.filter((item) => item.userId === person.id).length;
          const usedTotal = leaveTypes.reduce((sum, item) => sum + usedInYear(leaves, person.id, item, year), 0);
          return <section key={person.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${expanded ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}>
          <button type="button" aria-expanded={expanded} onClick={() => setExpandedEmployeeId(expanded ? '' : person.id)} className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-indigo-500">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">{(person.name || person.full_name || '?').slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{person.name || person.full_name}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{person.department || 'Employee'} · {configured}/{leaveTypes.length} allowances · {usedTotal} days used</span></span>
            <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && <div className="border-t border-slate-100 bg-slate-50/60 px-4 pb-2">
          <div className="divide-y divide-slate-100">{leaveTypes.filter((item) => type === 'all' || item === type).map((item) => {
            const allowance = allowances.find((entry) => entry.userId === person.id && entry.leaveType === item);
            const used = usedInYear(leaves, person.id, item, year);
            return <AllowanceRow key={`${person.id}:${year}:${item}`} label={item} allowed={allowance?.allowedDays} used={used} saving={saving === `${person.id}:${item}`} onSave={(value) => save(person.id, item, value)} />;
          })}</div></div>}
        </section>;
        })}
      </div>}
    </>}
  </AdminLayout>;
}

function AllowanceRow({ label, allowed, used, saving, onSave }: { label: string; allowed?: number; used: number; saving: boolean; onSave: (value: string) => void }) {
  const [value, setValue] = useState(allowed?.toString() || '');
  const [editing, setEditing] = useState(false);
  useEffect(() => { setValue(allowed?.toString() || ''); setEditing(false); }, [allowed]);
  const style = leaveTypeStyles[label] || leaveTypeStyles.casual;
  const remaining = allowed === undefined ? undefined : Math.max(0, allowed - used);
  const progress = allowed && allowed > 0 ? Math.min(100, (used / allowed) * 100) : 0;
  return <div className={`my-2 rounded-xl border ${style.border} bg-white p-3`}>
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold uppercase ${style.icon}`}>{label.slice(0, 1)}</span>
      <div className="min-w-0 flex-1"><p className={`text-xs font-bold capitalize ${style.text}`}>{label} leave</p><p className="mt-0.5 text-[11px] text-slate-500">{used} used · {allowed === undefined ? 'Allowance not set' : `${remaining} remaining of ${allowed} days`}</p></div>
      {!editing && <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>}
    </div>
    {allowed !== undefined && allowed > 0 && <div role="progressbar" aria-label={`${label} leave used`} aria-valuemin={0} aria-valuemax={allowed} aria-valuenow={Math.min(used, allowed)} className={`mt-3 h-1.5 overflow-hidden rounded-full ${style.track}`}><div className={`h-full rounded-full ${style.bar}`} style={{ width: `${progress}%` }} /></div>}
    {editing && <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3"><label className="flex-1 text-[11px] font-semibold text-slate-600">Allowed days<input type="number" min="0" max="366" aria-label={`${label} allowed days`} value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /></label>
      <button type="button" disabled={saving || value === '' || value === allowed?.toString()} onClick={() => onSave(value)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40">{saving ? 'Saving…' : 'Save'}</button>
      <button type="button" onClick={() => { setValue(allowed?.toString() || ''); setEditing(false); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
    </div>}
  </div>;
}
