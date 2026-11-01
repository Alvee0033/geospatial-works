'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { ExportUtils } from '@/lib/exportUtils';
import { filterReportRows, type ReportFilters } from '@/lib/reportData';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { getWorkLocation, type AttendanceWorkLocation } from '@/lib/attendanceData';
import { readPageCache, writePageCache } from '@/lib/pageCache';
import { mergeSettledData } from '@/lib/liveDataCache.mjs';

type Kind = 'financial' | 'expenses' | 'tasks' | 'leaves' | 'attendance';
type Format = 'csv' | 'xlsx' | 'pdf' | 'docx';
type Row = Record<string, unknown>;
type ReportsPageCache = { data: Record<Kind, Row[]>; projects: Row[]; users: Row[] };
const kinds: { id: Kind; label: string }[] = [
  { id: 'financial', label: 'Project financials' }, { id: 'expenses', label: 'Expenses' },
  { id: 'tasks', label: 'Tasks' }, { id: 'leaves', label: 'Leave requests' },
  { id: 'attendance', label: 'Attendance' },
];
const columns: Record<Kind, { key: string; label: string }[]> = {
  financial: [{ key: 'projectName', label: 'Project' }, { key: 'client', label: 'Client' }, { key: 'grossProjectValue', label: 'Contract value' }, { key: 'totalReceived', label: 'Received' }, { key: 'amountReceivable', label: 'Remaining' }, { key: 'status', label: 'Status' }],
  expenses: [{ key: 'date', label: 'Date' }, { key: 'projectName', label: 'Project' }, { key: 'categoryName', label: 'Category' }, { key: 'employeeName', label: 'Submitted by' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }],
  tasks: [{ key: 'title', label: 'Task' }, { key: 'projectName', label: 'Project' }, { key: 'assigneeName', label: 'Assigned to' }, { key: 'dueDate', label: 'Due date' }, { key: 'status', label: 'Status' }],
  leaves: [{ key: 'employeeName', label: 'Employee' }, { key: 'leaveType', label: 'Type' }, { key: 'startDate', label: 'From' }, { key: 'endDate', label: 'To' }, { key: 'totalDays', label: 'Days' }, { key: 'status', label: 'Status' }],
  attendance: [{ key: 'date', label: 'Date' }, { key: 'employeeName', label: 'Employee' }, { key: 'sessionType', label: 'Shift' }, { key: 'loginTime', label: 'Check-in' }, { key: 'categoryName', label: 'Work mode' }, { key: 'status', label: 'Status' }, { key: 'addressText', label: 'Check-in location' }],
};
const workLocationLabels: Record<AttendanceWorkLocation, string> = { office: 'Office', home: 'Home', home_office: 'Home office', field: 'Field', unknown: 'Unspecified' };
const workLocationTones: Record<AttendanceWorkLocation, string> = {
  office: 'bg-indigo-50 text-indigo-700', home: 'bg-violet-50 text-violet-700',
  home_office: 'bg-sky-50 text-sky-700', field: 'bg-amber-50 text-amber-700', unknown: 'bg-slate-100 text-slate-600',
};
const get = (row: Row | undefined, ...keys: string[]): string => {
  const value = keys.map((key) => row?.[key]).find((item) => item !== undefined && item !== null && item !== '');
  return value === undefined ? '' : String(value);
};
const dateLabel = (value: unknown) => { const d = new Date(String(value || '')); return !value || Number.isNaN(d.getTime()) ? String(value || '') : d.toLocaleDateString(); };
const fileSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const isMoneyColumn = (kind: Kind, key: string) => (kind === 'financial' && ['grossProjectValue', 'totalReceived', 'amountReceivable'].includes(key)) || (kind === 'expenses' && key === 'amount');
const statusTone = (value: string) => {
  const status = value.toLowerCase();
  if (['approved', 'completed', 'paid', 'present', 'on track'].some((part) => status.includes(part))) return 'bg-emerald-50 text-emerald-700';
  if (['pending', 'ongoing', 'in progress', 'late', 'at risk'].some((part) => status.includes(part))) return 'bg-amber-50 text-amber-700';
  if (['rejected', 'overdue', 'absent', 'off track'].some((part) => status.includes(part))) return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};
const exportTone: Record<Format, string> = {
  csv: 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100',
  xlsx: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  pdf: 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
  docx: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
};

export default function ReportsPage() {
  const [kind, setKind] = useState<Kind>('financial');
  const [data, setData] = useState<Record<Kind, Row[]>>({ financial: [], expenses: [], tasks: [], leaves: [], attendance: [] });
  const [projects, setProjects] = useState<Row[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const refresh = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    const requests = await Promise.allSettled([ApiClient.getProjects(), ApiClient.getExpenses(), ApiClient.getTasks(), ApiClient.getLeaves(), ApiClient.getAttendance(), ApiClient.getUsers()]);
    const merged = mergeSettledData(
      { projects, expenses: data.expenses, tasks: data.tasks, leaves: data.leaves, attendance: data.attendance, users },
      Object.fromEntries(['projects', 'expenses', 'tasks', 'leaves', 'attendance', 'users'].map((key, index) => [key, requests[index]])),
    );
    const p = merged.data.projects as Row[];
    const e = merged.data.expenses as Row[];
    const t = merged.data.tasks as Row[];
    const l = merged.data.leaves as Row[];
    const a = merged.data.attendance as Row[];
    const u = merged.data.users as Row[];
    const projectById = new Map(p.map((row) => [get(row, 'id'), row]));
    const userById = new Map(u.map((row) => [get(row, 'id'), row]));
    const projectName = (row: Row) => get(row, 'projectName', 'project_name') || get(projectById.get(String(get(row, 'projectId', 'project_id'))), 'name');
    const userName = (row: Row, ...idKeys: string[]) => get(row, 'employeeName', 'employee_name', 'userName', 'user_name', 'assigneeName', 'assignee_name') || get(userById.get(String(get(row, ...idKeys))), 'name', 'full_name');
    const taskAssignees = (row: Row) => {
      const source = row.assignees ?? row.assigneeIds ?? row.assignee_ids;
      const values = Array.isArray(source) ? source : [];
      const members = values.map((entry) => {
        const id = typeof entry === 'string' ? entry : get(entry as Row, 'id', 'userId', 'user_id');
        const user = userById.get(id);
        return { id, name: typeof entry === 'object' ? get(entry as Row, 'name', 'full_name') || get(user, 'name', 'full_name') : get(user, 'name', 'full_name') };
      }).filter((entry) => entry.id);
      if (!members.length && get(row, 'assigneeId', 'assignee_id')) {
        const id = get(row, 'assigneeId', 'assignee_id');
        members.push({ id, name: userName(row, 'assigneeId', 'assignee_id') });
      }
      return members;
    };
    const nextData: Record<Kind, Row[]> = {
      financial: p.map((row) => ({ ...row, projectId: get(row, 'id'), projectName: get(row, 'name'), totalReceived: get(row, 'amountReceived', 'amount_received', 'totalReceived', 'total_received') })),
      expenses: e.map((row) => ({ ...row, date: get(row, 'date', 'createdAt', 'created_at'), projectName: projectName(row), employeeName: userName(row, 'employeeId', 'employee_id', 'userId', 'user_id'), categoryName: get(row, 'categoryName', 'category_name', 'category') })),
      tasks: t.map((row) => {
        const assignees = taskAssignees(row);
        return { ...row, dueDate: get(row, 'dueDate', 'due_date'), date: get(row, 'createdAt', 'created_at', 'dueDate', 'due_date'), projectName: projectName(row), assignees, assigneeIds: assignees.map((person) => person.id), assigneeName: assignees.map((person) => person.name).filter(Boolean).join(', ') || 'Unassigned' };
      }),
      leaves: l.map((row) => ({ ...row, date: get(row, 'startDate', 'start_date'), employeeName: userName(row, 'userId', 'user_id', 'employeeId', 'employee_id'), status: get(row, 'status') || (row.isApproved || row.is_approved ? 'approved' : 'pending') })),
      attendance: a.map((row) => ({ ...row, date: get(row, 'date', 'attendanceDate', 'attendance_date', 'createdAt', 'created_at'), employeeName: userName(row, 'userId', 'user_id', 'employeeId', 'employee_id'), sessionType: get(row, 'sessionType', 'session_type'), loginTime: get(row, 'loginTime', 'login_time', 'checkInTime', 'check_in_time'), addressText: get(row, 'addressText', 'address_text'), categoryName: getWorkLocation(row) })),
    };
    setProjects(p);
    setUsers(u);
    setData(nextData);
    if (merged.failed.length === 0) writePageCache<ReportsPageCache>('reports', { data: nextData, projects: p, users: u });
    if (merged.failed.length) setError('Could not refresh ' + merged.failed.map((key) => key === 'users' ? 'employees' : key).join(', ') + '. Showing the last records received from the server where available.');
    setLoading(false);
  };
  useEffect(() => {
    const cached = readPageCache<ReportsPageCache>('reports');
    if (cached) {
      setData(cached.data);
      setProjects(cached.projects);
      setUsers(cached.users);
    }
    void refresh(true);
    return ApiClient.subscribeToDataRefresh(() => { void refresh(true); });
  }, []);

  const rows = data[kind];
  const filtered = useMemo(() => filterReportRows(rows, filters), [rows, filters]);
  const categoryOptions = [...new Set(rows.map((row) => String(get(row, 'categoryName', 'category_name', 'category', 'leaveType', 'leave_type'))).filter(Boolean))].sort();
  const statusOptions = [...new Set(rows.map((row) => String(get(row, 'status', 'approvalStatus', 'approval_status'))).filter(Boolean))].sort();
  const filter = (key: keyof ReportFilters, value: string) => setFilters((current) => ({ ...current, [key]: value && value !== 'all' ? value : undefined }));
  const clearFilters = () => setFilters({});

  const exportRows = async (format: Format, targetRows = filtered) => {
    if (!targetRows.length || exporting) return;
    setExporting(true);
    const reportTitle = (kinds.find((item) => item.id === kind)?.label || 'Report') + ' report';
    const recordName = targetRows.length === 1
      ? get(targetRows[0], 'projectName', 'title', 'employeeName', 'name', 'id')
      : '';
    const fileName = [fileSlug(reportTitle), recordName && fileSlug(recordName), new Date().toISOString().slice(0, 10)]
      .filter(Boolean)
      .join('_');
    const reportColumns = columns[kind];
    const headings = reportColumns.map((column) => column.label);
    const values = targetRows.map((row) => reportColumns.map((column) => {
      const value = row[column.key];
      if (kind === 'attendance' && column.key === 'categoryName') return workLocationLabels[String(value) as AttendanceWorkLocation] || 'Unspecified';
      return column.key.toLowerCase().includes('date') ? dateLabel(value) : String(value ?? '');
    }));
    try {
      if (format === 'csv') {
        const csv = [headings, ...values].map((line) => line.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = fileName + '.csv'; link.click(); URL.revokeObjectURL(url);
      } else if (format === 'xlsx') {
        ExportUtils.exportToExcel(targetRows.map((_, index) => Object.fromEntries(headings.map((heading, columnIndex) => [heading, values[index][columnIndex]]))), fileName, reportTitle);
      } else if (format === 'pdf') ExportUtils.exportToPdf(headings, values, reportTitle, fileName);
      else await ExportUtils.exportToDocx(reportTitle, [headings, ...values], fileName);
      notifyAction(`${targetRows.length === 1 ? 'Record' : `${targetRows.length} records`} exported as ${format === 'xlsx' ? 'Excel' : format.toUpperCase()}.`);
    } catch (error) {
      notifyAction(error instanceof Error ? error.message : 'The report could not be exported.', 'error', 'Export failed');
    } finally { setExporting(false); }
  };

  return <AdminLayout title="Reports" subtitle="Clear, exportable views of live business data">
    <div className="mx-auto max-w-[1480px] space-y-3 py-2">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div><div className="flex items-center gap-2"><h1 className="text-lg font-semibold tracking-tight text-slate-900">Reports</h1><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Server data</span></div><p className="mt-0.5 text-xs text-slate-500">Filter live records and export a report or a single row.</p></div>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button>
        </div>
        <div role="tablist" aria-label="Report type" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2">
          {kinds.map((item) => <button key={item.id} role="tab" aria-selected={kind === item.id} type="button" onClick={() => { setKind(item.id); clearFilters(); }} className={kind === item.id ? 'flex shrink-0 items-center gap-2 rounded-lg bg-[#eaf4ef] px-3 py-2 text-xs font-semibold text-[#174b37]' : 'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800'}>{item.label}<span className={kind === item.id ? 'rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] tabular-nums text-[#174b37]' : 'rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500'}>{data[item.id].length}</span></button>)}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><SlidersHorizontal size={14} className="text-emerald-700"/>Filters</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <label className="text-[11px] font-medium text-slate-500">From<input aria-label="From date" type="date" value={filters.from || ''} onChange={(e) => filter('from', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-400" /></label>
          <label className="text-[11px] font-medium text-slate-500">To<input aria-label="To date" type="date" value={filters.to || ''} onChange={(e) => filter('to', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-400" /></label>
          <label className="text-[11px] font-medium text-slate-500">Project<select aria-label="Project" value={filters.projectId || 'all'} onChange={(e) => filter('projectId', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="all">All projects</option>{projects.map((p) => <option key={get(p, 'id')} value={get(p, 'id')}>{get(p, 'name', 'projectName')}</option>)}</select></label>
          <label className="text-[11px] font-medium text-slate-500">Employee<select aria-label="Employee" value={filters.userId || 'all'} onChange={(e) => filter('userId', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="all">All employees</option>{users.map((u) => <option key={get(u, 'id')} value={get(u, 'id')}>{get(u, 'name', 'full_name', 'email')}</option>)}</select></label>
          <label className="text-[11px] font-medium text-slate-500">Status<select aria-label="Status" value={filters.status || 'all'} onChange={(e) => filter('status', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="all">All statuses</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="text-[11px] font-medium text-slate-500">{kind === 'attendance' ? 'Work location' : kind === 'leaves' ? 'Leave type' : 'Category'}<select aria-label={kind === 'attendance' ? 'Work location' : kind === 'leaves' ? 'Leave type' : 'Category'} value={filters.category || 'all'} onChange={(e) => filter('category', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="all">{kind === 'attendance' ? 'All work locations' : kind === 'leaves' ? 'All leave types' : 'All categories'}</option>{categoryOptions.map((category) => <option key={category} value={category}>{kind === 'attendance' ? workLocationLabels[category as AttendanceWorkLocation] || 'Unspecified' : category}</option>)}</select></label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
          <div className="relative min-w-[220px] flex-1"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search report" value={filters.search || ''} onChange={(e) => filter('search', e.target.value)} placeholder="Search this report" className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50" /></div>
          <span className="px-1 text-[11px] tabular-nums text-slate-500">{filtered.length} of {rows.length} records</span>
          <button type="button" onClick={clearFilters} className="h-9 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100">Clear filters</button>
          <div className="flex flex-wrap gap-1.5">{(['csv', 'xlsx', 'pdf', 'docx'] as Format[]).map((format) => <button key={format} type="button" disabled={!filtered.length || exporting} onClick={() => void exportRows(format)} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors disabled:opacity-40 ${exportTone[format]}`}>{format === 'pdf' || format === 'docx' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}{format === 'xlsx' ? 'Excel' : format === 'docx' ? 'Word' : format.toUpperCase()}</button>)}</div>
        </div>
      </section>
      {error && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">{kinds.find((item) => item.id === kind)?.label}</h2><p className="mt-0.5 text-[11px] text-slate-500">Showing {filtered.length} matching records</p></div><span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-600">{filtered.length} rows</span></div>
        <div className="min-h-[50vh] max-h-[66vh] overflow-auto"><table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500"><tr>{columns[kind].map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-2.5">{column.label}</th>)}<th className="px-4 py-2.5 text-right">Export row</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.length ? filtered.map((row, index) => <tr key={get(row, 'id') || kind + index} className="hover:bg-indigo-50/30">{columns[kind].map((column) => { const value = String(row[column.key] ?? ''); const location = value as AttendanceWorkLocation; const display = kind === 'attendance' && column.key === 'categoryName' ? workLocationLabels[location] || 'Unspecified' : column.key.toLowerCase().includes('date') ? dateLabel(row[column.key]) : isMoneyColumn(kind, column.key) && Number.isFinite(Number(value)) ? `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Number(value))}` : value || '—'; return <td key={column.key} className="max-w-[260px] truncate whitespace-nowrap px-4 py-3 text-slate-700">{column.key === 'status' && value ? <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusTone(value)}`}>{display}</span> : kind === 'attendance' && column.key === 'categoryName' ? <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${workLocationTones[location] || workLocationTones.unknown}`}>{display}</span> : display}</td>; })}<td className="px-4 py-2 text-right"><div className="inline-flex gap-1"><button type="button" aria-label="Export row as CSV" title="Export this record as CSV" onClick={() => void exportRows('csv', [row])} className="rounded-md bg-teal-50 p-2 text-teal-700 hover:bg-teal-100"><Download size={15} /></button><button type="button" onClick={() => void exportRows('pdf', [row])} className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">PDF</button></div></td></tr>) : <tr><td colSpan={columns[kind].length + 1} className="px-4 py-14 text-center text-sm text-slate-500">{error ? 'Records could not be loaded.' : loading ? 'Refreshing records…' : 'No records match these filters.'}</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  </AdminLayout>;
}
