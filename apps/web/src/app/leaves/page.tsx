'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  CalendarDays,
  Settings2,
  Plus,
  Trash2,
  FileText,
  Calendar,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  Eye,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LeaveClarificationThread } from '@/components/leaves/LeaveClarificationThread';
import { LeaveHistoryPanel } from '@/components/leaves/LeaveHistoryPanel';
import Link from 'next/link';

const leaveTypeColors: Record<string, { dot: string; card: string; badge: string }> = {
  casual: { dot: 'bg-blue-600', card: 'border-blue-200 bg-blue-50/60', badge: 'bg-blue-100 text-blue-800' },
  sick: { dot: 'bg-emerald-600', card: 'border-emerald-200 bg-emerald-50/60', badge: 'bg-emerald-100 text-emerald-800' },
  emergency: { dot: 'bg-amber-500', card: 'border-amber-200 bg-amber-50/70', badge: 'bg-amber-100 text-amber-800' },
  paid: { dot: 'bg-violet-600', card: 'border-violet-200 bg-violet-50/60', badge: 'bg-violet-100 text-violet-800' },
  unpaid: { dot: 'bg-slate-500', card: 'border-slate-200 bg-slate-50', badge: 'bg-slate-100 text-slate-700' },
  maternity: { dot: 'bg-pink-600', card: 'border-pink-200 bg-pink-50/60', badge: 'bg-pink-100 text-pink-800' },
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<'leaves' | 'holidays'>('leaves');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [expandedEmployeeIds, setExpandedEmployeeIds] = useState<string[]>([]);
  const [detailsModalLeave, setDetailsModalLeave] = useState<any | null>(null);
  const [canReviewLeaves, setCanReviewLeaves] = useState(false);
  const [canManageLeaveRecords, setCanManageLeaveRecords] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('your account');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [allowances, setAllowances] = useState<{ userId: string; leaveType: string; allowedDays: number }[]>([]);
  const [reviewingLeaveId, setReviewingLeaveId] = useState<string | null>(null);
  const openedLeaveDeepLink = useRef(false);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Leave Form
  const [leaveUserId, setLeaveUserId] = useState('');
  const [leaveEmployeeSearch, setLeaveEmployeeSearch] = useState('');
  const [leaveEmployeePickerOpen, setLeaveEmployeePickerOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('casual');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Holiday Form
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayRecurring, setHolidayRecurring] = useState(false);

  const fetchLeavesAndHolidays = async (silent = false) => {
    if (!silent) setLoading(true);
    const results = await Promise.allSettled([ApiClient.getLeaves(), ApiClient.getHolidays(), ApiClient.getUsers()]);
    const labels = ['leave requests', 'holidays', 'employees'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (index === 0) setLeaves(result.value || []);
        if (index === 1) setHolidays(result.value || []);
        if (index === 2) {
          const usersData = result.value || [];
          setUsers(usersData);
          if (usersData.length > 0 && !leaveUserId) {
            const user = JSON.parse(localStorage.getItem('gw_user') || '{}');
            const canManage = ['main_admin', 'finance_manager', 'finance'].includes(user.role);
            setLeaveUserId(canManage ? usersData[0].id : user.id || '');
          }
        }
      }
    });
    const failed = results.flatMap((result, index) => result.status === 'rejected' ? [labels[index]] : []);
    setLoadError(failed.length ? `Could not refresh ${failed.join(', ')}. Showing the last server records where available.` : '');
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('gw_user') || '{}');
      setCanReviewLeaves(['main_admin', 'project_manager', 'finance_manager', 'finance'].includes(user.role));
      setCanManageLeaveRecords(['main_admin', 'finance_manager', 'finance'].includes(user.role));
      setCurrentUserName(user.fullName || user.name || user.email || 'your account');
      setCurrentUserId(String(user.id || user._id || ''));
      setCurrentUserRole(String(user.role || ''));
    } catch { setCanReviewLeaves(false); setCanManageLeaveRecords(false); }
    void fetchLeavesAndHolidays();
    const unsubscribe = ApiClient.subscribeToDataRefresh(() => { void fetchLeavesAndHolidays(true); });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const year = Number(selectedMonth.slice(0, 4));
    ApiClient.getLeaveAllowances(year).then(setAllowances).catch(() => setAllowances([]));
  }, [selectedMonth]);

  useEffect(() => {
    if (openedLeaveDeepLink.current || typeof window === 'undefined') return;
    const leaveId = new URLSearchParams(window.location.search).get('leaveId');
    if (!leaveId) return;
    const leave = leaves.find((item) => String(item.id) === leaveId);
    if (!leave) return;
    openedLeaveDeepLink.current = true;
    setActiveTab('leaves');
    setDetailsModalLeave(leave);
  }, [leaves]);

  const leaveStatus = (leave: any) => String(leave.status || (leave.isApproved || leave.is_approved ? 'approved' : 'pending')).toLowerCase();
  const leaveDaysInMonth = (leave: any) => {
    const start = new Date(`${String(leave.startDate).slice(0, 10)}T00:00:00`);
    const end = new Date(`${String(leave.endDate).slice(0, 10)}T00:00:00`);
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const first = Math.max(start.getTime(), monthStart.getTime());
    const last = Math.min(end.getTime(), monthEnd.getTime());
    return Math.max(0, Math.floor((last - first) / 86400000) + 1);
  };
  const employeeLeaves = leaves.filter((leave) => selectedEmployeeFilter === 'all' || leave.userId === selectedEmployeeFilter);
  const monthlyLeaves = employeeLeaves.filter((leave) => leaveDaysInMonth(leave) > 0);
  const visibleLeaves = leaves.filter((leave) => {
    const matchesStatus = leaveStatusFilter === 'all' || leaveStatus(leave) === leaveStatusFilter;
    const matchesEmployee = selectedEmployeeFilter === 'all' || leave.userId === selectedEmployeeFilter;
    const matchedUser = users.find((user) => user.id === leave.userId || user._id === leave.userId);
    const name = leave.userName || leave.user_name || matchedUser?.name || matchedUser?.full_name || '';
    const employeeMatchesSearch = `${name} ${matchedUser?.department || ''} ${matchedUser?.email || ''}`
      .toLowerCase().includes(employeeSearch.trim().toLowerCase());
    return matchesStatus && matchesEmployee && employeeMatchesSearch && leaveDaysInMonth(leave) > 0;
  });
  const leaveGroupsMap = new Map<string, any[]>();
  visibleLeaves.forEach((leave) => {
    const key = String(leave.userId || leave.user_id || 'unknown');
    const existing = leaveGroupsMap.get(key) || [];
    existing.push(leave);
    leaveGroupsMap.set(key, existing);
  });
  const employeeGroups = Array.from(leaveGroupsMap.entries());
  const displayedEmployeeGroups = showAllRecords ? employeeGroups : employeeGroups.slice(0, 5);
  const requestedDays = monthlyLeaves.reduce((sum, leave) => sum + leaveDaysInMonth(leave), 0);
  const approvedDays = monthlyLeaves.filter((leave) => leaveStatus(leave) === 'approved')
    .reduce((sum, leave) => sum + leaveDaysInMonth(leave), 0);
  const balanceUserId = selectedEmployeeFilter !== 'all' ? selectedEmployeeFilter : canReviewLeaves ? '' : currentUserId;
  const balanceEmployeeName = users.find((user) => user.id === balanceUserId)?.name || currentUserName;
  const balanceYear = Number(selectedMonth.slice(0, 4));
  const usedInYear = (type: string) => leaves.filter((leave) => leave.userId === balanceUserId && leave.leaveType === type && leaveStatus(leave) === 'approved')
    .reduce((sum, leave) => {
      const start = new Date(`${String(leave.startDate).slice(0, 10)}T00:00:00`).getTime();
      const end = new Date(`${String(leave.endDate).slice(0, 10)}T00:00:00`).getTime();
      const first = new Date(balanceYear, 0, 1).getTime();
      const last = new Date(balanceYear, 11, 31).getTime();
      return sum + (Number.isNaN(start) || Number.isNaN(end) ? 0 : Math.max(0, Math.floor((Math.min(end, last) - Math.max(start, first)) / 86400000) + 1));
    }, 0);

  const handleLeaveDecision = async (id: string, approved: boolean) => {
    setReviewingLeaveId(id);
    try {
      if (approved) await ApiClient.approveLeave(id);
      else await ApiClient.rejectLeave(id);
      await fetchLeavesAndHolidays();
    } catch (err: any) {
      notifyAction(`Could not ${approved ? 'approve' : 'decline'} leave: ${err.message}`, 'error', 'Leave decision failed');
    } finally { setReviewingLeaveId(null); }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiClient.createLeave({
        userId: leaveUserId,
        leaveType,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason,
      });
      setIsLeaveModalOpen(false);
      setLeaveReason('');
      setLeaveEmployeeSearch('');
      setLeaveEmployeePickerOpen(false);
      await fetchLeavesAndHolidays();
      notifyAction('Leave request submitted.');
    } catch (err: any) {
      notifyAction(`Leave request could not be submitted: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm('Are you sure you want to revoke/delete this leave record?')) return;
    try {
      await ApiClient.deleteLeave(id);
      await fetchLeavesAndHolidays();
      notifyAction('Leave record removed.');
    } catch (err: any) {
      notifyAction(`Leave record could not be removed: ${err.message}`, 'error');
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiClient.createHoliday({
        name: holidayName,
        date: holidayDate,
        isRecurring: holidayRecurring,
      });
      setIsHolidayModalOpen(false);
      setHolidayName('');
      await fetchLeavesAndHolidays();
      notifyAction('Company holiday added.');
    } catch (err: any) {
      notifyAction(`Holiday could not be added: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Delete this company holiday?')) return;
    try {
      await ApiClient.deleteHoliday(id);
      await fetchLeavesAndHolidays();
      notifyAction('Holiday removed.');
    } catch (err: any) {
      notifyAction(`Holiday could not be removed: ${err.message}`, 'error');
    }
  };

  const handleExport = () => {
    if (activeTab === 'leaves') {
      const rows = leaves.map((l) => ({
        ID: l.id,
        Employee: l.userName || l.user_name || 'Staff',
        Type: l.leaveType,
        'Start Date': l.startDate,
        'End Date': l.endDate,
        Reason: l.reason || 'N/A',
      }));
      ExportUtils.exportToExcel(rows, 'GW_Official_Leaves_Register');
    } else {
      const rows = holidays.map((h) => ({
        ID: h.id,
        Holiday: h.name,
        Date: h.date,
        Recurring: h.isRecurring ? 'Yes' : 'No',
      }));
      ExportUtils.exportToExcel(rows, 'GW_Official_Company_Holidays');
    }
  };

  return (
    <AdminLayout
      title="Leave & holidays"
      subtitle="Review leave requests and manage the company calendar."
      onRefresh={() => { void fetchLeavesAndHolidays(); }}
      onExport={handleExport}
      isRefreshing={loading}
    >
      {loadError && <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><span>{loadError}</span><button type="button" onClick={() => void fetchLeavesAndHolidays()} className="font-semibold underline">Retry</button></div>}
      {/* Tab Switcher & Action Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-1 rounded-lg bg-slate-50 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === 'leaves' ? 'bg-[#0D1117] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Leave Records ({leaves.length})
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === 'holidays' ? 'bg-[#0D1117] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Company Holidays ({holidays.length})
          </button>
        </div>

        <div>
          {activeTab === 'leaves' ? (
            <button
              onClick={() => { setLeaveEmployeeSearch(''); setLeaveEmployeePickerOpen(false); setIsLeaveModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D1117] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>{canManageLeaveRecords ? 'Record Employee Leave' : 'Apply for Leave'}</span>
            </button>
          ) : canManageLeaveRecords ? (
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Plus size={14} />
              <span>Add holiday</span>
            </button>
          ) : null}
          {['main_admin', 'finance_manager'].includes(currentUserRole) && <Link href="/leaves/settings" className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Settings2 size={15} /> Leave Settings</Link>}
        </div>
      </div>

      {activeTab === 'leaves' ? (
        /* Leaves Table */
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Past Leave Records</h3>
              <p className="text-xs text-slate-500">Choose an employee and month to review their leave history.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{monthlyLeaves.length} requests this month</span>
          </div>

          {balanceUserId ? <div className="mb-4">
            <p className="mb-2 text-xs font-bold text-slate-700">{balanceEmployeeName} · {balanceYear} annual balance</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{['casual', 'sick', 'emergency', 'paid', 'unpaid', 'maternity'].map((type) => {
              const allowed = allowances.find((item) => item.userId === balanceUserId && item.leaveType === type)?.allowedDays;
              const used = usedInYear(type);
              return <div key={type} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] font-semibold capitalize text-slate-600">{type}</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{used}{allowed === undefined ? '' : ` / ${allowed}`}</p>
                <p className="text-[10px] text-slate-500">{allowed === undefined ? 'Allowance not set' : `${allowed - used} days left`}</p>
              </div>;
            })}</div>
          </div> : <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-800">Choose an employee to see their allowed, used, and remaining leave days.</div>}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Filter leave records by status">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button key={status} type="button" onClick={() => setLeaveStatusFilter(status)} aria-pressed={leaveStatusFilter === status}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${leaveStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {status === 'rejected' ? 'Declined' : status} ({status === 'all' ? monthlyLeaves.length : monthlyLeaves.filter((leave) => leaveStatus(leave) === status).length})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="leaveMonthFilter" className="text-xs font-semibold text-slate-500">Month:</label>
              <input id="leaveMonthFilter" type="month" value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setShowAllRecords(false); }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none" />
              <label htmlFor="employeeFilterSelect" className="text-xs font-semibold text-slate-500">Employee:</label>
              <select
                id="employeeFilterSelect"
                value={selectedEmployeeFilter}
                onChange={(e) => { setSelectedEmployeeFilter(e.target.value); setShowAllRecords(false); }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Employees ({users.length})</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.full_name || u.email} {u.department ? `(${u.department})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">Search employees</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={employeeSearch} onChange={(event) => { setEmployeeSearch(event.target.value); setShowAllRecords(false); }} placeholder="Search employee name, department, or email…" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              {employeeSearch && <button type="button" onClick={() => setEmployeeSearch('')} aria-label="Clear employee search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={15} /></button>}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="leaveMonthFilter" className="text-xs font-semibold text-slate-500">Month</label>
              <input id="leaveMonthFilter" type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setShowAllRecords(false); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              <label htmlFor="employeeFilterSelect" className="text-xs font-semibold text-slate-500">Employee</label>
              <select id="employeeFilterSelect" value={selectedEmployeeFilter} onChange={(e) => { setSelectedEmployeeFilter(e.target.value); setShowAllRecords(false); }} className="h-10 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="all">All employees ({users.length})</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.full_name || u.email}{u.department ? ` · ${u.department}` : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Filter leave records by status">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => <button key={status} type="button" onClick={() => setLeaveStatusFilter(status)} aria-pressed={leaveStatusFilter === status} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${leaveStatusFilter === status ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{status === 'rejected' ? 'Declined' : status} ({status === 'all' ? monthlyLeaves.length : monthlyLeaves.filter((leave) => leaveStatus(leave) === status).length})</button>)}
            </div>
            <span className="text-xs text-slate-500">{visibleLeaves.length} leave {visibleLeaves.length === 1 ? 'record' : 'records'}</span>
          </div>

          {visibleLeaves.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <CalendarDays size={24} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">{loading ? 'Fetching leave records…' : 'No leave records found'}</p>
              <p className="mt-1 text-xs text-slate-500">Try a different employee, month, or status filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedEmployeeGroups.map(([employeeId, records]) => {
                const user = users.find((entry) => entry.id === employeeId || entry._id === employeeId);
                const name = records[0]?.userName || records[0]?.user_name || user?.name || user?.full_name || 'Employee';
                const avatar = records[0]?.avatarUrl || user?.avatarUrl || user?.avatar_url;
                const expanded = expandedEmployeeIds.includes(employeeId);
                const pendingCount = records.filter((record) => leaveStatus(record) === 'pending').length;
                return <section key={employeeId} className={`overflow-hidden rounded-2xl border transition ${expanded ? 'border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <button type="button" aria-expanded={expanded} onClick={() => setExpandedEmployeeIds((current) => expanded ? current.filter((id) => id !== employeeId) : [...current, employeeId])} className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-indigo-500">
                    <UserAvatar src={avatar} name={name} size="md" shape="rounded" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">{name}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{user?.department || 'Employee'} · {records.length} {records.length === 1 ? 'leave record' : 'leave records'}{pendingCount ? ` · ${pendingCount} awaiting review` : ''}</span>
                    </span>
                    <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 sm:inline-flex">{records.reduce((sum, leave) => sum + leaveDaysInMonth(leave), 0)} days this month</span>
                    <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded && <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                    {records.map((leave) => {
                      const status = leaveStatus(leave);
                      const colors = leaveTypeColors[String(leave.leaveType || '').toLowerCase()] || leaveTypeColors.casual;
                      return <article key={leave.id} className={`rounded-xl border p-3 sm:p-4 ${colors.card}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className={`mt-1 size-2.5 shrink-0 rounded-full ${colors.dot}`} />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${colors.badge}`}>{leave.leaveType || 'leave'}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${status === 'approved' ? 'bg-emerald-100 text-emerald-800' : status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{status === 'rejected' ? 'Declined' : status}</span>
                              </div>
                              <p className="mt-2 text-xs font-semibold text-slate-800">{leave.startDate} <span className="px-1 text-slate-400">→</span> {leave.endDate} <span className="font-normal text-slate-500">· {leaveDaysInMonth(leave)} days in selected month</span></p>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{leave.reason || 'Personal / General leave'}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                            <button type="button" onClick={() => setDetailsModalLeave(leave)} className="inline-flex items-center gap-1 rounded-lg border border-white/80 bg-white/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-white"><Eye size={12} /> Details</button>
                            {canReviewLeaves && status === 'pending' && <>
                              <button disabled={reviewingLeaveId === leave.id} onClick={() => handleLeaveDecision(leave.id, true)} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-50">Approve</button>
                              <button disabled={reviewingLeaveId === leave.id} onClick={() => handleLeaveDecision(leave.id, false)} className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-50">Decline</button>
                            </>}
                            {canManageLeaveRecords && <button onClick={() => handleDeleteLeave(leave.id)} aria-label={`Delete ${name}'s leave record`} className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-rose-600"><Trash2 size={14} /></button>}
                          </div>
                        </div>
                      </article>;
                    })}
                  </div>}
                </section>;
              })}
            </div>
          )}
          {employeeGroups.length > 5 && <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setShowAllRecords(!showAllRecords)} className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {showAllRecords ? 'Show fewer employees' : `View all ${employeeGroups.length} employees`}
            </button>
          </div>}
        </div>
      ) : (
        /* Holidays Table */
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Official Company Holidays</h3>
              <p className="text-xs text-slate-400">Corporate non-working calendar days accounted for in payroll</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{holidays.length} Holidays</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Holiday Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Recurring</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      {loading ? 'Loading holidays...' : 'No official holidays scheduled.'}
                    </td>
                  </tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{h.name}</td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">{h.date}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {h.isRecurring ? 'Yearly' : 'One-time'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteHoliday(h.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Holiday"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">{canManageLeaveRecords ? 'Record Employee Leave' : 'Apply for Leave'}</h4>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              {canManageLeaveRecords ? <div>
                <label htmlFor="recordLeaveEmployeeSearch" className="mb-1 block font-semibold text-slate-700">Employee</label>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="recordLeaveEmployeeSearch" role="combobox" aria-expanded={leaveEmployeePickerOpen && leaveEmployeeSearch.trim().length > 0} aria-controls="recordLeaveEmployeeOptions" aria-autocomplete="list" autoComplete="off" value={leaveEmployeePickerOpen ? leaveEmployeeSearch : (() => { const selected = users.find((person) => person.id === leaveUserId); return selected?.name || selected?.full_name || selected?.email || ''; })()} onFocus={() => { setLeaveEmployeePickerOpen(true); setLeaveEmployeeSearch(''); }} onChange={(event) => { setLeaveEmployeeSearch(event.target.value); setLeaveUserId(''); setLeaveEmployeePickerOpen(true); }} placeholder="Search employee by name, email, or department" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  {leaveEmployeePickerOpen && leaveEmployeeSearch.trim() && <div id="recordLeaveEmployeeOptions" role="listbox" className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {users.filter((person) => `${person.name || person.full_name || ''} ${person.email || ''} ${person.department || ''}`.toLowerCase().includes(leaveEmployeeSearch.trim().toLowerCase())).slice(0, 8).map((person) => <button key={person.id} type="button" role="option" aria-selected={leaveUserId === person.id} onClick={() => { setLeaveUserId(person.id); setLeaveEmployeeSearch(''); setLeaveEmployeePickerOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-indigo-50">
                      <UserAvatar src={person.avatarUrl || person.avatar_url} name={person.name || person.full_name || 'Employee'} size="sm" shape="rounded" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{person.name || person.full_name || 'Employee'}</span><span className="block truncate text-[10px] text-slate-500">{person.email || person.department || 'Staff'}{person.department && person.email ? ` · ${person.department}` : ''}</span></span>
                    </button>)}
                    {users.filter((person) => `${person.name || person.full_name || ''} ${person.email || ''} ${person.department || ''}`.toLowerCase().includes(leaveEmployeeSearch.trim().toLowerCase())).length === 0 && <p className="px-3 py-4 text-center text-xs text-slate-500">No employees match that search.</p>}
                  </div>}
                </div>
                {leaveUserId && <p className="mt-1.5 text-[10px] text-emerald-700">Leave will be recorded for the selected employee.</p>}
              </div> : <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">Submitting as {currentUserName}</div>}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="paid">Annual / Paid Leave</option>
                  <option value="maternity">Maternity / Paternity</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Medical reason, prescription details, family emergency..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !leaveUserId}
                  className="px-5 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Record Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Add Company Holiday</h4>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Holiday Title</label>
                <input
                  type="text"
                  required
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g. Independence Day, Eid-ul-Fitr"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Holiday Date</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={holidayRecurring}
                  onChange={(e) => setHolidayRecurring(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="recurringCheck" className="text-slate-700 font-medium cursor-pointer">
                  Annual recurring national holiday
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Details Modal */}
      {detailsModalLeave && (() => {
        const leave = detailsModalLeave;
        const status = leaveStatus(leave);
        const u = users.find((usr) => usr.id === leave.userId || usr._id === leave.userId);
        const name = leave.userName || (u ? (u.name || u.full_name) : 'Employee');
        const email = u?.email || leave.userEmail || 'N/A';
        const department = u?.department || leave.department || 'General';
        const avatar = leave.avatarUrl || u?.avatarUrl || u?.avatar_url;

        // Calculate days span
        let durationText = '';
        if (leave.startDate && leave.endDate) {
          const s = new Date(leave.startDate);
          const e = new Date(leave.endDate);
          const diffTime = Math.abs(e.getTime() - s.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          durationText = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in duration-150 sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-indigo-600" />
                  <h4 className="text-base font-bold text-slate-900">Leave Request Details</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsModalLeave(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Employee Info Header */}
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <UserAvatar src={avatar} name={name} size="md" shape="rounded" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <p className="truncate text-slate-500">{email} &bull; {department}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                    status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {status === 'rejected' ? 'Declined' : status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 p-2.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Leave Category</span>
                    <p className="mt-1 font-bold capitalize text-slate-800">{leave.leaveType || 'General'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-2.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Duration</span>
                    <p className="mt-1 font-bold text-slate-800">{durationText || 'Custom Duration'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 p-2.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Date Range</span>
                  <p className="mt-1 font-mono text-xs font-semibold text-slate-800">
                    {leave.startDate} &rarr; {leave.endDate}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 p-3">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Reason / Notes</span>
                  <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-slate-700">
                    {leave.reason || 'No detailed explanation provided for this leave.'}
                  </p>
                </div>

                {/* Decision Actions */}
                {canReviewLeaves && status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      disabled={reviewingLeaveId === leave.id}
                      onClick={async () => {
                        await handleLeaveDecision(leave.id, false);
                        setDetailsModalLeave(null);
                      }}
                      className="rounded-lg bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    >
                      Decline Request
                    </button>
                    <button
                      type="button"
                      disabled={reviewingLeaveId === leave.id}
                      onClick={async () => {
                        await handleLeaveDecision(leave.id, true);
                        setDetailsModalLeave(null);
                      }}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Approve Request
                    </button>
                  </div>
                )}
                <LeaveHistoryPanel key={leave.id} leave={leave} leaves={leaves} onSelect={setDetailsModalLeave} />
                <LeaveClarificationThread leaveId={leave.id} employeeName={name} />
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
}

