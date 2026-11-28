'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { ExportUtils } from '@/lib/exportUtils';
import { filterReportRows, type ReportFilters } from '@/lib/reportData';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { getWorkLocation, type AttendanceWorkLocation } from '@/lib/attendanceData';
import { readPageCache, writePageCache } from '@/lib/pageCache';
import { mergeSettledData } from '@/lib/liveDataCache.mjs';

type Kind = 'financial' | 'expenses' | 'tasks' | 'leaves' | 'attendance' | 'payroll' | 'audit';
type Format = 'csv' | 'xlsx' | 'pdf' | 'docx';
type Row = Record<string, unknown>;
type ReportsPageCache = { data: Record<Kind, Row[]>; projects: Row[]; users: Row[] };

const kinds: { id: Kind; label: string }[] = [
  { id: 'financial', label: 'Project Financials' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'leaves', label: 'Leave Requests' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'payroll', label: 'Payroll & Salary' },
  { id: 'audit', label: 'Audit Logs' },
];

const columns: Record<Kind, { key: string; label: string }[]> = {
  financial: [
    { key: 'projectName', label: 'Project' },
    { key: 'client', label: 'Client' },
    { key: 'grossProjectValue', label: 'Total Project Value' },
    { key: 'budget', label: 'Budget' },
    { key: 'totalReceived', label: 'Received' },
    { key: 'amountReceivable', label: 'Receivable' },
    { key: 'officeBenefit', label: 'Office Benefit' },
    { key: 'totalSpent', label: 'Total Spent' },
    { key: 'expenseRatio', label: 'Expense Ratio' },
    { key: 'netRevenue', label: 'Net Revenue' },
    { key: 'netMarginPct', label: 'Margin' },
    { key: 'status', label: 'Status' },
  ],
  expenses: [
    { key: 'date', label: 'Date' },
    { key: 'projectName', label: 'Project' },
    { key: 'categoryName', label: 'Category' },
    { key: 'employeeName', label: 'Submitted By' },
    { key: 'baseCost', label: 'Base Cost' },
    { key: 'taxVat', label: 'VAT / Tax' },
    { key: 'amount', label: 'Total Amount' },
    { key: 'receiptInfo', label: 'Receipt Status' },
    { key: 'details', label: 'Details / Meal Info' },
    { key: 'justificationStatus', label: 'Justification' },
    { key: 'status', label: 'Status' },
    { key: 'rejectionReason', label: 'Rejection Reason' },
  ],
  tasks: [
    { key: 'title', label: 'Task' },
    { key: 'projectName', label: 'Project' },
    { key: 'assigneeName', label: 'Assigned To' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
  ],
  leaves: [
    { key: 'employeeName', label: 'Employee' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'startDate', label: 'From Date' },
    { key: 'endDate', label: 'To Date' },
    { key: 'totalDays', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
  ],
  attendance: [
    { key: 'date', label: 'Date' },
    { key: 'employeeName', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'sessionType', label: 'Shift' },
    { key: 'loginTime', label: 'Check-in Time' },
    { key: 'categoryName', label: 'Work Mode' },
    { key: 'status', label: 'Status' },
    { key: 'addressText', label: 'Location' },
    { key: 'notes', label: 'Notes / Early Departure' },
  ],
  payroll: [
    { key: 'employeeName', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'monthlyBaseSalary', label: 'Base Salary' },
    { key: 'totalAdditions', label: 'Allowances' },
    { key: 'totalDeductions', label: 'Deductions' },
    { key: 'finalPayableSalary', label: 'Net Payable' },
    { key: 'status', label: 'Status' },
  ],
  audit: [
    { key: 'createdAt', label: 'Timestamp' },
    { key: 'actorName', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'entityType', label: 'Entity' },
    { key: 'detailsText', label: 'Details' },
  ],
};

const workLocationLabels: Record<AttendanceWorkLocation, string> = {
  office: 'Office',
  home: 'Home',
  home_office: 'Home Office',
  field: 'Field',
  unknown: 'Unspecified',
};

const workLocationTones: Record<AttendanceWorkLocation, string> = {
  office: 'bg-indigo-50 text-indigo-700',
  home: 'bg-violet-50 text-violet-700',
  home_office: 'bg-sky-50 text-sky-700',
  field: 'bg-amber-50 text-amber-700',
  unknown: 'bg-slate-100 text-slate-600',
};

const get = (row: Row | undefined, ...keys: string[]): string => {
  const value = keys.map((key) => row?.[key]).find((item) => item !== undefined && item !== null && item !== '');
  return value === undefined ? '' : String(value);
};

const hasNumeric = (row: Row | undefined, ...keys: string[]): number | null => {
  for (const key of keys) {
    const val = row?.[key];
    if (val !== undefined && val !== null && val !== '') {
      const n = Number(val);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
};

const formatLabel = (value: string): string => {
  if (!value) return '—';
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const dateLabel = (value: unknown) => {
  if (!value) return '—';
  const d = new Date(String(value));
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const dateTimeLabel = (value: unknown) => {
  if (!value) return '—';
  const d = new Date(String(value));
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const timeLabel = (value: unknown) => {
  if (!value) return '—';
  const d = new Date(String(value));
  return !Number.isNaN(d.getTime()) ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : String(value);
};

const formatMoneyUi = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;
const formatMoneyDoc = (amount: number) => `BDT ${Math.round(amount).toLocaleString('en-US')}`;
const fileSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const isMoneyColumn = (kind: Kind, key: string) =>
  (kind === 'financial' && ['grossProjectValue', 'totalReceived', 'amountReceivable', 'budget', 'officeBenefit', 'totalSpent', 'netRevenue'].includes(key)) ||
  (kind === 'expenses' && ['amount', 'baseCost', 'taxVat'].includes(key)) ||
  (kind === 'payroll' && ['monthlyBaseSalary', 'totalAdditions', 'totalDeductions', 'finalPayableSalary'].includes(key));

const isNumericColumn = (kind: Kind, key: string) =>
  isMoneyColumn(kind, key) || ['expenseRatio', 'netMarginPct', 'totalDays'].includes(key);

const isTruncatedColumn = (key: string) =>
  ['projectName', 'client', 'title', 'assigneeName', 'employeeName', 'department', 'designation', 'reason', 'addressText', 'notes', 'details', 'rejectionReason', 'detailsText', 'receiptInfo'].includes(key);

const statusTone = (value: string) => {
  const status = value.toLowerCase();
  if (['approved', 'completed', 'paid', 'present', 'on track', 'finalized', 'done'].some((part) => status.includes(part))) return 'bg-emerald-50 text-emerald-700';
  if (['pending', 'ongoing', 'in progress', 'in_progress', 'late', 'at risk'].some((part) => status.includes(part))) return 'bg-amber-50 text-amber-700';
  if (['rejected', 'overdue', 'absent', 'off track', 'high'].some((part) => status.includes(part))) return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};

const exportTone: Record<Format, string> = {
  csv: 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100',
  xlsx: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  pdf: 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
  docx: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
};

const kpiToneStyles: Record<string, { border: string; text: string; dot: string }> = {
  slate: { border: 'border-slate-200', text: 'text-slate-900', dot: 'bg-slate-400' },
  indigo: { border: 'border-indigo-100', text: 'text-indigo-950', dot: 'bg-indigo-500' },
  emerald: { border: 'border-emerald-100', text: 'text-emerald-950', dot: 'bg-emerald-500' },
  amber: { border: 'border-amber-100', text: 'text-amber-950', dot: 'bg-amber-500' },
  sky: { border: 'border-sky-100', text: 'text-sky-950', dot: 'bg-sky-500' },
  violet: { border: 'border-violet-100', text: 'text-violet-950', dot: 'bg-violet-500' },
};

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [kind, setKind] = useState<Kind>('financial');
  const [data, setData] = useState<Record<Kind, Row[]>>({
    financial: [], expenses: [], tasks: [], leaves: [], attendance: [], payroll: [], audit: [],
  });
  const [projects, setProjects] = useState<Row[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(() => currentYear);
  const refreshSequence = useRef(0);

  const refresh = async (silent = false) => {
    const sequence = ++refreshSequence.current;
    if (!silent) setLoading(true);
    setError('');
    const now = new Date();
    const pastDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const defaultFrom = pastDate.toISOString().slice(0, 10);
    const fromStr = filters.from || (filters.to && filters.to < defaultFrom ? `${filters.to.slice(0, 7)}-01` : defaultFrom);
    const toStr = filters.to || now.toISOString().slice(0, 10);

    const requests = await Promise.allSettled([
      ApiClient.getProjects(),
      ApiClient.getExpenses(),
      ApiClient.getTasks(),
      ApiClient.getLeaves(),
      ApiClient.getAttendance({ from: fromStr, to: toStr }),
      ApiClient.getUsers(),
      ApiClient.getSalaryReport(reportMonth, reportYear),
      ApiClient.getAuditLogs(),
    ]);
    if (sequence !== refreshSequence.current) return;
    const merged = mergeSettledData(
      {
        projects,
        expenses: data.expenses,
        tasks: data.tasks,
        leaves: data.leaves,
        attendance: data.attendance,
        users,
        audit: data.audit,
      },
      Object.fromEntries(['projects', 'expenses', 'tasks', 'leaves', 'attendance', 'users', 'audit'].map((key, index) => [
        key,
        requests[index === 6 ? 7 : index],
      ])),
    );
    const p = merged.data.projects as Row[];
    const e = merged.data.expenses as Row[];
    const t = merged.data.tasks as Row[];
    const l = merged.data.leaves as Row[];
    const a = merged.data.attendance as Row[];
    const u = merged.data.users as Row[];
    const auditRaw = merged.data.audit as Row[];
    const salaryResult = requests[6].status === 'fulfilled' ? requests[6].value : null;
    const salaryList = (salaryResult?.employees || []) as Row[];

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
      financial: p.map((row) => {
        const projId = get(row, 'id');
        const projGrossVal = hasNumeric(row, 'grossProjectValue', 'gross_project_value') ?? 0;
        const projBudget = hasNumeric(row, 'budget') ?? 0;
        const projReceived = hasNumeric(row, 'amountReceived', 'amount_received', 'totalReceived', 'total_received') ?? 0;
        const explicitReceivable = hasNumeric(row, 'amountReceivable', 'amount_receivable');
        const projReceivable = explicitReceivable !== null ? explicitReceivable : Math.max(0, projGrossVal - projReceived);

        const taxStatus = String(get(row, 'taxStatus', 'tax_status') || 'included').toLowerCase();
        const rawTaxRate = hasNumeric(row, 'taxRate', 'tax_rate') ?? 0.10;
        const rawIncomeTaxRate = hasNumeric(row, 'incomeTaxRate', 'income_tax_rate') ?? 0;
        const vatPct = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
        const itPct = rawIncomeTaxRate > 1 ? rawIncomeTaxRate / 100 : rawIncomeTaxRate;
        const taxWithheld = taxStatus === 'included' ? Math.round(projGrossVal * Math.min(1, vatPct + itPct)) : 0;
        const projectValueAfterTax = Math.max(0, projGrossVal - taxWithheld);

        const projExpenses = e.filter(
          (exp) => String(get(exp, 'projectId', 'project_id')) === String(projId) &&
            ['approved', 'paid'].includes(String(get(exp, 'status')).toLowerCase()),
        );
        const totalSpent = projExpenses.reduce((sum, exp) => sum + (Number(get(exp, 'amount')) || 0), 0);

        const rawBenefitRate = hasNumeric(row, 'officeBenefitRate', 'office_benefit_rate');
        const benefitRate = rawBenefitRate !== null ? (rawBenefitRate > 1 ? rawBenefitRate / 100 : rawBenefitRate) : 0.30;
        const officeBenefit = Math.round((projBudget || projGrossVal) * benefitRate);

        const expenseRatio = projBudget > 0 ? Math.round((totalSpent / projBudget) * 100) : (projGrossVal > 0 ? Math.round((totalSpent / projGrossVal) * 100) : 0);

        // Net Revenue = Profit remaining after subtracting project cost from after-tax project value
        const netRevenue = Math.max(0, projectValueAfterTax - totalSpent);
        const netMarginPct = projectValueAfterTax > 0 ? Math.round((netRevenue / projectValueAfterTax) * 100) : 0;

        return {
          ...row,
          date: get(row, 'startDate', 'start_date', 'createdAt', 'created_at'),
          projectId: projId,
          projectName: get(row, 'name') || 'Project',
          client: get(row, 'client', 'client_name') || 'Internal',
          grossProjectValue: projGrossVal,
          projectValueAfterTax,
          budget: projBudget,
          totalReceived: projReceived,
          amountReceivable: projReceivable,
          officeBenefit,
          totalSpent,
          expenseRatio: `${expenseRatio}%`,
          netRevenue,
          netMarginPct: `${netMarginPct}%`,
          status: get(row, 'status') || 'ongoing',
        };
      }),
      expenses: e.map((row) => {
        const vatAmt = Number(get(row, 'vatAmount', 'vat_amount')) || 0;
        const taxAmt = Number(get(row, 'taxAmount', 'tax_amount')) || 0;
        const totalTaxVat = vatAmt + taxAmt;
        const grossAmount = Number(get(row, 'amount')) || 0;
        const explicitBase = hasNumeric(row, 'baseCost', 'base_cost');
        const baseCost = explicitBase !== null ? explicitBase : Math.max(0, grossAmount - totalTaxVat);

        const food = row.foodDetails as Row | undefined;
        let foodStr = '';
        if (food) {
          foodStr = [food.mealType, food.numberOfPeople ? `${food.numberOfPeople} people` : ''].filter(Boolean).join(' • ');
        }
        const note = get(row, 'note', 'description');
        const combinedDetails = [foodStr, note].filter(Boolean).join(' — ') || '—';

        const photos = Array.isArray(row.receiptPhotos) ? row.receiptPhotos : (Array.isArray(row.receiptPhotoUrls) ? row.receiptPhotoUrls : []);
        const photoCount = photos.length || (row.receiptPhotoUrl || row.hasReceipt ? 1 : 0);
        const receiptStr = photoCount > 0 ? `Attached (${photoCount})` : 'No receipt';

        const justStatus = get(row, 'justificationStatus', 'justification_status') || 'none';
        const justificationText = justStatus === 'none' ? 'Not Required' : justStatus === 'required' ? 'Required' : justStatus === 'submitted' ? 'Pending Review' : formatLabel(justStatus);

        const rawProjId = get(row, 'projectId', 'project_id');
        const expType = get(row, 'expenseType', 'expense_type') || (rawProjId ? 'project' : 'office');

        return {
          ...row,
          date: get(row, 'date', 'createdAt', 'created_at'),
          expenseType: expType,
          projectName: projectName(row) || (rawProjId ? 'Project unavailable' : 'Office Expense'),
          employeeName: userName(row, 'employeeId', 'employee_id', 'userId', 'user_id') || 'Staff',
          categoryName: get(row, 'categoryName', 'category_name', 'category') || 'General',
          baseCost,
          taxVat: totalTaxVat,
          amount: grossAmount,
          receiptInfo: receiptStr,
          details: combinedDetails,
          justificationStatus: justificationText,
          status: get(row, 'status') || 'pending',
          rejectionReason: get(row, 'rejectionReason', 'rejection_reason') || (String(get(row, 'status')).toLowerCase() === 'rejected' ? 'No reason recorded' : '—'),
        };
      }),
      tasks: t.map((row) => {
        const assignees = taskAssignees(row);
        return {
          ...row,
          dueDate: get(row, 'dueDate', 'due_date'),
          date: get(row, 'createdAt', 'created_at', 'dueDate', 'due_date'),
          projectName: projectName(row) || '—',
          assignees,
          assigneeIds: assignees.map((person) => person.id),
          assigneeName: assignees.map((person) => person.name).filter(Boolean).join(', ') || 'Unassigned',
          priority: get(row, 'priority') || 'Medium',
          status: get(row, 'status') || 'pending',
        };
      }),
      leaves: l.map((row) => {
        const startStr = get(row, 'startDate', 'start_date');
        const endStr = get(row, 'endDate', 'end_date') || startStr;
        const explicitDays = hasNumeric(row, 'totalDays', 'days', 'total_days');
        let computedDays = explicitDays;
        if (computedDays === null && startStr) {
          const s = new Date(startStr);
          const en = new Date(endStr);
          if (!Number.isNaN(s.getTime()) && !Number.isNaN(en.getTime())) {
            computedDays = Math.max(1, Math.round((en.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          }
        }
        return {
          ...row,
          date: startStr,
          startDate: startStr,
          endDate: endStr,
          totalDays: computedDays ?? 1,
          leaveType: formatLabel(get(row, 'leaveType', 'leave_type') || 'casual'),
          employeeName: userName(row, 'userId', 'user_id', 'employeeId', 'employee_id') || 'Employee',
          reason: get(row, 'reason') || '—',
          status: get(row, 'status') || (row.isApproved || row.is_approved ? 'approved' : 'pending'),
        };
      }),
      attendance: a.map((row) => {
        const rawTime = get(row, 'loginTime', 'login_time', 'checkInTime', 'check_in_time');
        const rawShift = get(row, 'sessionType', 'session_type', 'shift');
        const shift = rawShift === 'morning' ? 'Morning Shift' : rawShift === 'afternoon' ? 'Afternoon Shift' : rawShift || 'Morning Shift';
        const workLoc = getWorkLocation(row);
        const rawStatus = get(row, 'status');
        const isLate = Boolean(
          row.isLate ||
          row.is_late ||
          Number(row.lateMinutes ?? row.late_minutes ?? 0) > 0 ||
          String(rawStatus).toLowerCase().includes('late') ||
          String(row.notes ?? '').toLowerCase().includes('late'),
        );
        const resolvedStatus = isLate && (!rawStatus || String(rawStatus).toLowerCase() === 'present') ? 'late' : rawStatus ? String(rawStatus).toLowerCase() : 'present';
        const addr = get(row, 'addressText', 'address_text', 'location', 'place', 'workLocation');
        const rawNote = get(row, 'notes', 'note', 'reason', 'remarks') || '';

        return {
          ...row,
          date: get(row, 'date', 'attendanceDate', 'attendance_date', 'createdAt', 'created_at'),
          employeeName: userName(row, 'userId', 'user_id', 'employeeId', 'employee_id') || 'Staff',
          department: get(row, 'department') || get(userById.get(String(get(row, 'userId', 'user_id', 'employeeId', 'employee_id'))), 'department') || '—',
          sessionType: shift,
          loginTime: timeLabel(rawTime),
          categoryName: workLoc,
          status: resolvedStatus,
          addressText: addr || '—',
          notes: rawNote || '—',
        };
      }),
      payroll: requests[6].status === 'rejected' ? data.payroll : salaryList.map((emp) => ({
        id: get(emp, 'userId', 'user_id', 'id'),
        userId: get(emp, 'userId', 'user_id', 'id'),
        employeeName: get(emp, 'userName', 'user_name', 'name') || 'Employee',
        department: get(emp, 'department') || '—',
        designation: get(emp, 'designation') || '—',
        monthlyBaseSalary: Number(get(emp, 'monthlyBaseSalary', 'monthly_base_salary', 'baseSalary')) || 0,
        totalAdditions: Number(get(emp, 'totalAdditions', 'total_additions')) || 0,
        totalDeductions: (emp.attendanceDeductionsEnabled === false ? 0 : Number(get(emp, 'totalAbsenceDeductions', 'total_absence_deductions')) || 0) + (Number(get(emp, 'totalPenalties', 'total_penalties')) || 0),
        finalPayableSalary: Number(get(emp, 'finalPayableSalary', 'final_payable_salary')) || 0,
        status: emp.isConfirmed || emp.is_confirmed ? 'Finalized' : 'Pending Confirmation',
        date: `${reportYear}-${String(reportMonth).padStart(2, '0')}-01`,
      })),
      audit: auditRaw.map((log) => {
        const rawDetails = log.details;
        const detailsText = typeof rawDetails === 'string'
          ? rawDetails
          : rawDetails && typeof rawDetails === 'object'
            ? Object.entries(rawDetails as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')
            : '—';
        return {
          ...log,
          date: get(log, 'createdAt', 'created_at'),
          createdAt: get(log, 'createdAt', 'created_at'),
          actorName: get(log, 'actorName', 'actor_name', 'userName', 'user_name') || userName(log, 'userId', 'user_id', 'actorId', 'actor_id') || 'System',
          action: formatLabel(get(log, 'action') || 'Event'),
          entityType: formatLabel(get(log, 'entityType', 'entity_type') || 'Record'),
          status: get(log, 'action') || 'logged',
          detailsText: detailsText || '—',
        };
      }),
    };

    setProjects(p);
    setUsers(u);
    setData(nextData);
    if (merged.failed.length === 0 && requests[6].status === 'fulfilled') {
      writePageCache<ReportsPageCache>('reports', { data: nextData, projects: p, users: u });
    }
    const failed = [...merged.failed, ...(requests[6].status === 'rejected' ? ['payroll'] : [])];
    if (failed.length) {
      setError('Could not refresh ' + failed.map((key) => (key === 'users' ? 'employees' : key)).join(', ') + '. Showing the last records received from the server.');
    }
    setLoading(false);
  };

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const cached = readPageCache<ReportsPageCache>('reports');
    if (cached) {
      setData((prev) => ({ ...prev, ...cached.data }));
      setProjects(cached.projects || []);
      setUsers(cached.users || []);
    }
    void refreshRef.current(true);
    return ApiClient.subscribeToDataRefresh(() => {
      void refreshRef.current(true);
    });
  }, []);

  useEffect(() => {
    if (kind === 'payroll' || (kind === 'attendance' && (filters.from || filters.to))) {
      queueMicrotask(() => {
        void refreshRef.current(true);
      });
    }
  }, [kind, reportMonth, reportYear, filters.from, filters.to]);

  const rows = data[kind];

  const filtered = useMemo(() => {
    if (kind === 'leaves' && (filters.from || filters.to)) {
      const baseFiltered = filterReportRows(rows, { ...filters, from: undefined, to: undefined });
      return baseFiltered.filter((row) => {
        const s = String(get(row, 'startDate', 'date')).slice(0, 10);
        const e = String(get(row, 'endDate', 'startDate', 'date')).slice(0, 10);
        if (filters.from && e && e < filters.from) return false;
        if (filters.to && s && s > filters.to) return false;
        return true;
      });
    }
    return filterReportRows(rows, filters);
  }, [rows, filters, kind]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      const val = String(get(row, 'categoryName', 'category_name', 'category', 'leaveType', 'leave_type')).trim();
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort();
  }, [rows]);

  const statusOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      const val = String(get(row, 'status', 'approvalStatus', 'approval_status')).trim();
      if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
    });
    return Array.from(map.values()).sort();
  }, [rows]);

  const clientOptions = useMemo(
    () => [...new Set(data.financial.map((r) => String(get(r, 'client')).trim()).filter(Boolean))].sort(),
    [data.financial],
  );

  const departmentOptions = useMemo(
    () => [...new Set(rows.map((r) => String(get(r, 'department')).trim()).filter((d) => d && d !== '—'))].sort(),
    [rows],
  );

  const filter = (key: keyof ReportFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value && value !== 'all' ? value : undefined }));
  const clearFilters = () => setFilters({});

  const kpis = useMemo(() => {
    const totalCount = filtered.length;

    if (kind === 'financial') {
      const contractVal = filtered.reduce((acc, r) => acc + (Number(r.grossProjectValue) || 0), 0);
      const budget = filtered.reduce((acc, r) => acc + (Number(r.budget) || 0), 0);
      const received = filtered.reduce((acc, r) => acc + (Number(r.totalReceived) || 0), 0);
      const receivable = filtered.reduce((acc, r) => acc + (Number(r.amountReceivable) || 0), 0);
      const spentTotal = filtered.reduce((acc, r) => acc + (Number(r.totalSpent) || 0), 0);
      const netRevTotal = filtered.reduce((acc, r) => acc + (Number(r.netRevenue) || 0), 0);

      return [
        { label: 'Total Projects', value: totalCount.toString(), helper: 'Portfolio count', tone: 'slate' },
        { label: 'Total Project Value', value: formatMoneyUi(contractVal), helper: 'Gross Contract Value', tone: 'indigo' },
        { label: 'Total Budgeted', value: formatMoneyUi(budget), helper: 'Allocated Funds', tone: 'sky' },
        { label: 'Total Received', value: formatMoneyUi(received), helper: `Receivable: ${formatMoneyUi(receivable)}`, tone: 'emerald' },
        { label: 'Total Spent', value: formatMoneyUi(spentTotal), helper: 'Approved & Paid Costs', tone: 'amber' },
        { label: 'Net Revenue', value: formatMoneyUi(netRevTotal), helper: 'Profit After Cost & Tax', tone: 'violet' },
      ];
    }

    if (kind === 'expenses') {
      const grossAmt = filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
      const baseCost = filtered.reduce((acc, r) => acc + (Number(r.baseCost) || 0), 0);
      const vatTax = filtered.reduce((acc, r) => acc + (Number(r.taxVat) || 0), 0);
      const approvedCount = filtered.filter((r) => String(r.status).toLowerCase() === 'approved').length;
      const pendingCount = filtered.filter((r) => String(r.status).toLowerCase() === 'pending').length;
      const approvalRate = totalCount ? Math.round((approvedCount / totalCount) * 100) : 0;
      const receiptsAttached = filtered.filter((r) => String(r.receiptInfo).includes('Attached')).length;

      return [
        { label: 'Total Claims', value: totalCount.toString(), helper: `${approvedCount} approved • ${pendingCount} pending`, tone: 'slate' },
        { label: 'Total Amount', value: formatMoneyUi(grossAmt), helper: 'Gross Expenditures (BDT)', tone: 'emerald' },
        { label: 'Total Base Cost', value: formatMoneyUi(baseCost), helper: 'Net Direct Cost', tone: 'indigo' },
        { label: 'Total VAT / Tax', value: formatMoneyUi(vatTax), helper: 'Statutory Deductions', tone: 'violet' },
        { label: 'Approval Rate', value: `${approvalRate}%`, helper: `${receiptsAttached} vouchers attached`, tone: 'amber' },
      ];
    }

    if (kind === 'attendance') {
      const presentCount = filtered.filter((r) => ['present', 'late'].includes(String(r.status).toLowerCase())).length;
      const lateCount = filtered.filter((r) => String(r.status).toLowerCase().includes('late')).length;
      const onTimeCount = Math.max(0, presentCount - lateCount);
      const attendanceRate = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;
      const officeCount = filtered.filter((r) => r.categoryName === 'office').length;
      const remoteCount = totalCount - officeCount;

      return [
        { label: 'Total Records', value: totalCount.toString(), helper: 'Logged attendance sessions', tone: 'slate' },
        { label: 'Attendance Rate', value: `${attendanceRate}%`, helper: `${presentCount} of ${totalCount} present`, tone: 'emerald' },
        { label: 'On-Time Arrivals', value: onTimeCount.toString(), helper: `${totalCount ? Math.round((onTimeCount / totalCount) * 100) : 0}% punctuality`, tone: 'indigo' },
        { label: 'Late Check-ins', value: lateCount.toString(), helper: 'Delayed logins flagged', tone: 'amber' },
        { label: 'Office vs Field', value: `${officeCount} / ${remoteCount}`, helper: `${officeCount} office • ${remoteCount} field/remote`, tone: 'sky' },
      ];
    }

    if (kind === 'tasks') {
      const completedCount = filtered.filter((r) => ['completed', 'done'].some((s) => String(r.status).toLowerCase().includes(s))).length;
      const inProgressCount = filtered.filter((r) => ['progress', 'doing', 'ongoing'].some((s) => String(r.status).toLowerCase().includes(s))).length;
      const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

      return [
        { label: 'Total Tasks', value: totalCount.toString(), helper: 'All deliverables', tone: 'slate' },
        { label: 'Completion Rate', value: `${completionRate}%`, helper: `${completedCount} completed`, tone: 'emerald' },
        { label: 'In Progress', value: inProgressCount.toString(), helper: 'Active deliverables', tone: 'indigo' },
        { label: 'Pending / Backlog', value: Math.max(0, totalCount - completedCount - inProgressCount).toString(), helper: 'Queued tasks', tone: 'amber' },
      ];
    }

    if (kind === 'leaves') {
      const approvedCount = filtered.filter((r) => String(r.status).toLowerCase() === 'approved').length;
      const pendingCount = filtered.filter((r) => String(r.status).toLowerCase() === 'pending').length;
      const totalDays = filtered.reduce((acc, r) => acc + (hasNumeric(r, 'totalDays', 'days', 'total_days') ?? 1), 0);

      return [
        { label: 'Total Requests', value: totalCount.toString(), helper: 'Leave submissions', tone: 'slate' },
        { label: 'Total Days Requested', value: `${totalDays} days`, helper: 'Time off aggregate', tone: 'indigo' },
        { label: 'Approved Requests', value: approvedCount.toString(), helper: `${totalCount ? Math.round((approvedCount / totalCount) * 100) : 0}% granted`, tone: 'emerald' },
        { label: 'Pending Decisions', value: pendingCount.toString(), helper: 'Awaiting authorization', tone: 'amber' },
      ];
    }

    if (kind === 'audit') {
      const uniqueActors = new Set(filtered.map((r) => String(r.actorName || ''))).size;
      const uniqueEntities = new Set(filtered.map((r) => String(r.entityType || ''))).size;
      return [
        { label: 'Audit Events', value: totalCount.toString(), helper: 'Recorded system actions', tone: 'slate' },
        { label: 'Active Actors', value: uniqueActors.toString(), helper: 'Distinct users', tone: 'indigo' },
        { label: 'Entity Types', value: uniqueEntities.toString(), helper: 'Affected modules', tone: 'emerald' },
      ];
    }

    const baseTotal = filtered.reduce((acc, r) => acc + (Number(r.monthlyBaseSalary) || 0), 0);
    const additionsTotal = filtered.reduce((acc, r) => acc + (Number(r.totalAdditions) || 0), 0);
    const deductionsTotal = filtered.reduce((acc, r) => acc + (Number(r.totalDeductions) || 0), 0);
    const payableTotal = filtered.reduce((acc, r) => acc + (Number(r.finalPayableSalary) || 0), 0);
    const finalizedCount = filtered.filter((r) => String(r.status).toLowerCase().includes('finalized')).length;

    return [
      { label: 'Employees on Payroll', value: totalCount.toString(), helper: `${finalizedCount} finalized`, tone: 'slate' },
      { label: 'Total Base Payroll', value: formatMoneyUi(baseTotal), helper: 'Gross Monthly Base', tone: 'indigo' },
      { label: 'Total Allowances', value: formatMoneyUi(additionsTotal), helper: 'Bonus & Adjustments', tone: 'emerald' },
      { label: 'Total Deductions', value: formatMoneyUi(deductionsTotal), helper: 'Absence & Penalties', tone: 'amber' },
      { label: 'Net Payable Salary', value: formatMoneyUi(payableTotal), helper: 'Total Disbursement', tone: 'sky' },
    ];
  }, [filtered, kind]);

  const exportRows = async (format: Format, targetRows = filtered) => {
    if (!targetRows.length || exporting) return;
    setExporting(true);
    const baseLabel = kinds.find((item) => item.id === kind)?.label || 'Report';
    const reportTitle = kind === 'payroll'
      ? `${baseLabel} Report — ${new Date(reportYear, reportMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
      : `${baseLabel} Report`;
    const recordName = targetRows.length === 1
      ? get(targetRows[0], 'projectName', 'title', 'employeeName', 'actorName', 'name', 'id')
      : '';
    const fileName = [fileSlug(reportTitle), recordName && fileSlug(recordName), new Date().toISOString().slice(0, 10)]
      .filter(Boolean)
      .join('_');
    const reportColumns = columns[kind];
    const headings = reportColumns.map((column) => column.label);

    const values = targetRows.map((row) =>
      reportColumns.map((column) => {
        const rawVal = row[column.key];
        if (kind === 'attendance' && column.key === 'categoryName') {
          return workLocationLabels[String(rawVal) as AttendanceWorkLocation] || 'Unspecified';
        }
        if (column.key === 'createdAt') {
          return dateTimeLabel(rawVal);
        }
        if (column.key.toLowerCase().includes('date') && !column.key.toLowerCase().includes('update')) {
          return dateLabel(rawVal);
        }
        if (column.key === 'status' && rawVal) {
          return formatLabel(String(rawVal));
        }
        if (isMoneyColumn(kind, column.key)) {
          const num = Number(rawVal);
          if (Number.isFinite(num)) {
            if (format === 'pdf' || format === 'docx') {
              return formatMoneyDoc(num);
            }
            return Math.round(num);
          }
        }
        return rawVal === null || rawVal === undefined || rawVal === '' ? (format === 'pdf' || format === 'docx' ? '—' : '') : String(rawVal);
      }),
    );

    // Append Totals row when exporting multiple rows with numeric/money columns
    if (targetRows.length > 1 && ['financial', 'expenses', 'payroll', 'leaves'].includes(kind)) {
      const totalsRow = reportColumns.map((column, colIdx) => {
        if (colIdx === 0) return 'Total';
        if (isMoneyColumn(kind, column.key)) {
          const sum = targetRows.reduce((acc, r) => acc + (Number(r[column.key]) || 0), 0);
          return format === 'pdf' || format === 'docx' ? formatMoneyDoc(sum) : Math.round(sum);
        }
        if (kind === 'leaves' && column.key === 'totalDays') {
          const sum = targetRows.reduce((acc, r) => acc + (Number(r[column.key]) || 0), 0);
          return format === 'pdf' || format === 'docx' ? `${sum} days` : sum;
        }
        return '';
      });
      values.push(totalsRow);
    }

    const recordUnit = targetRows.length === 1 ? 'record' : 'records';
    const subtitle = kind === 'payroll'
      ? `${targetRows.length} ${recordUnit}  ·  ${new Date(reportYear, reportMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
      : kind === 'financial' && !filters.from && !filters.to
        ? `${targetRows.length} ${recordUnit}  ·  Current Project Financial Snapshot`
        : `${targetRows.length} ${recordUnit}  ·  ${filters.from || 'All dates'} to ${filters.to || 'today'}`;

    try {
      if (format === 'csv') {
        const csv =
          '\uFEFF' +
          [headings, ...values]
            .map((line) => line.map((cell) => '"' + String(cell ?? '').replaceAll('"', '""') + '"').join(','))
            .join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'xlsx') {
        const excelData = values.map((rowVals) =>
          Object.fromEntries(headings.map((heading, columnIndex) => [heading, rowVals[columnIndex]])),
        );
        ExportUtils.exportToExcel(excelData, fileName, reportTitle.slice(0, 31));
      } else if (format === 'pdf') {
        await ExportUtils.exportToPdf(headings, values as string[][], reportTitle, fileName, {
          orientation: headings.length > 6 ? 'landscape' : 'portrait',
          subtitle,
        });
      } else {
        await ExportUtils.exportToDocx(reportTitle, [headings, ...values.map((r) => r.map((c) => String(c ?? '')))], fileName, { subtitle });
      }
      notifyAction(`${targetRows.length} ${recordUnit} exported as ${format === 'xlsx' ? 'Excel' : format === 'docx' ? 'Word' : format.toUpperCase()}.`);
    } catch (err) {
      notifyAction(err instanceof Error ? err.message : 'The report could not be exported.', 'error', 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const kpiGridCols = kpis.length >= 6
    ? 'xl:grid-cols-6'
    : kpis.length === 5
      ? 'xl:grid-cols-5'
      : kpis.length === 3
        ? 'xl:grid-cols-3'
        : 'xl:grid-cols-4';

  return (
    <AdminLayout title="Reports" subtitle="Clear, exportable views of live business data">
      <div className="mx-auto max-w-[1480px] space-y-3 py-2">
        {/* Navigation & Header */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-slate-900">Reports</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live Sync
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Filter live business records and export formatted audit reports or individual rows.</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <div role="tablist" aria-label="Report type" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2">
            {kinds.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={kind === item.id}
                type="button"
                onClick={() => {
                  setKind(item.id);
                  clearFilters();
                }}
                className={
                  kind === item.id
                    ? 'flex shrink-0 items-center gap-2 rounded-lg bg-[#eaf4ef] px-3 py-2 text-xs font-semibold text-[#174b37]'
                    : 'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }
              >
                {item.label}
                <span
                  className={
                    kind === item.id
                      ? 'rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] tabular-nums text-[#174b37]'
                      : 'rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500'
                  }
                >
                  {data[item.id].length}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* KPI Metric Chips */}
        <section className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${kpiGridCols}`}>
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className={`rounded-xl border ${kpiToneStyles[kpi.tone]?.border || 'border-slate-200'} bg-white p-3 shadow-xs transition-shadow hover:shadow-sm`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</span>
                <span className={`h-2 w-2 rounded-full ${kpiToneStyles[kpi.tone]?.dot || 'bg-slate-400'}`} />
              </div>
              <p className={`mt-1 text-lg font-bold tracking-tight tabular-nums ${kpiToneStyles[kpi.tone]?.text || 'text-slate-900'}`}>
                {kpi.value}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">{kpi.helper}</p>
            </div>
          ))}
        </section>

        {/* Filter Controls & Global Export Actions */}
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <SlidersHorizontal size={14} className="text-emerald-700" />
              Filters
            </div>
            {kind === 'attendance' && !filters.from && !filters.to && (
              <span className="text-[10px] font-medium text-slate-400">Default window: Last 90 days</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {kind === 'payroll' ? (
              <>
                <label className="text-[11px] font-medium text-slate-500">
                  Month
                  <select aria-label="Payroll month" value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700">
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index} value={index + 1}>{new Date(2024, index).toLocaleString('en-US', { month: 'long' })}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] font-medium text-slate-500">
                  Year
                  <select aria-label="Payroll year" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700">
                    {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="text-[11px] font-medium text-slate-500">
                  From Date
                  <input
                    aria-label="From date"
                    type="date"
                    value={filters.from || ''}
                    onChange={(e) => filter('from', e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="text-[11px] font-medium text-slate-500">
                  To Date
                  <input
                    aria-label="To date"
                    type="date"
                    value={filters.to || ''}
                    onChange={(e) => filter('to', e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-400"
                  />
                </label>
              </>
            )}

            {['financial', 'expenses', 'tasks'].includes(kind) && (
              <label className="text-[11px] font-medium text-slate-500">
                Project
                <select
                  aria-label="Project"
                  value={filters.projectId || 'all'}
                  onChange={(e) => filter('projectId', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">All projects</option>
                  {projects.map((p) => (
                    <option key={get(p, 'id')} value={get(p, 'id')}>
                      {get(p, 'name', 'projectName')}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {kind === 'financial' && (
              <label className="text-[11px] font-medium text-slate-500">
                Client
                <select
                  aria-label="Client"
                  value={filters.client || 'all'}
                  onChange={(e) => filter('client', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">All clients</option>
                  {clientOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}

            {!['financial', 'audit'].includes(kind) && (
              <label className="text-[11px] font-medium text-slate-500">
                {kind === 'tasks' ? 'Assignee' : 'Employee'}
                <select
                  aria-label="Employee"
                  value={filters.userId || 'all'}
                  onChange={(e) => filter('userId', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">All employees</option>
                  {users.map((u) => (
                    <option key={get(u, 'id')} value={get(u, 'id')}>
                      {get(u, 'name', 'full_name', 'email')}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {['attendance', 'payroll'].includes(kind) && departmentOptions.length > 0 && (
              <label className="text-[11px] font-medium text-slate-500">
                Department
                <select
                  aria-label="Department"
                  value={filters.department || 'all'}
                  onChange={(e) => filter('department', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">All departments</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </label>
            )}

            {kind === 'attendance' && (
              <label className="text-[11px] font-medium text-slate-500">
                Shift
                <select
                  aria-label="Shift"
                  value={filters.shift || 'all'}
                  onChange={(e) => filter('shift', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">All shifts</option>
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                </select>
              </label>
            )}

            {kind === 'expenses' && (
              <>
                <label className="text-[11px] font-medium text-slate-500">
                  Expense Type
                  <select
                    aria-label="Expense type"
                    value={filters.expenseType || 'all'}
                    onChange={(e) => filter('expenseType', e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                  >
                    <option value="all">All types</option>
                    <option value="project">Project Expense</option>
                    <option value="office">Office Expense</option>
                  </select>
                </label>
                <label className="text-[11px] font-medium text-slate-500">
                  Receipt
                  <select
                    aria-label="Receipt status"
                    value={filters.receiptStatus || 'all'}
                    onChange={(e) => filter('receiptStatus', e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                  >
                    <option value="all">All receipts</option>
                    <option value="attached">Attached</option>
                    <option value="missing">No receipt</option>
                  </select>
                </label>
              </>
            )}

            {kind === 'tasks' && (
              <label className="text-[11px] font-medium text-slate-500">
                Priority
                <select
                  aria-label="Priority"
                  value={filters.priority || 'all'}
                  onChange={(e) => filter('priority', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
            )}

            <label className="text-[11px] font-medium text-slate-500">
              {kind === 'audit' ? 'Action' : 'Status'}
              <select
                aria-label="Status"
                value={filters.status || 'all'}
                onChange={(e) => filter('status', e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                <option value="all">{kind === 'audit' ? 'All actions' : 'All statuses'}</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{formatLabel(status)}</option>
                ))}
              </select>
            </label>

            {['expenses', 'leaves', 'attendance'].includes(kind) && (
              <label className="text-[11px] font-medium text-slate-500">
                {kind === 'attendance' ? 'Work Location' : kind === 'leaves' ? 'Leave Type' : 'Category'}
                <select
                  aria-label={kind === 'attendance' ? 'Work location' : kind === 'leaves' ? 'Leave type' : 'Category'}
                  value={filters.category || 'all'}
                  onChange={(e) => filter('category', e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value="all">
                    {kind === 'attendance' ? 'All work locations' : kind === 'leaves' ? 'All leave types' : 'All categories'}
                  </option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {kind === 'attendance' ? workLocationLabels[category as AttendanceWorkLocation] || 'Unspecified' : category}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
            <div className="relative min-w-[200px] flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search report"
                value={filters.search || ''}
                onChange={(e) => filter('search', e.target.value)}
                placeholder="Search this report..."
                className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
              />
            </div>
            <span className="px-1 text-[11px] tabular-nums text-slate-500">
              {filtered.length} of {rows.length} records
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Clear filters
            </button>
            <div className="flex flex-wrap gap-1.5">
              {(['csv', 'xlsx', 'pdf', 'docx'] as Format[]).map((format) => (
                <button
                  key={format}
                  type="button"
                  disabled={!filtered.length || exporting}
                  onClick={() => void exportRows(format)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors disabled:opacity-40 ${exportTone[format]}`}
                >
                  {format === 'pdf' || format === 'docx' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}
                  {format === 'xlsx' ? 'Excel' : format === 'docx' ? 'Word' : format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        {/* Records Data Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {kinds.find((item) => item.id === kind)?.label}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Showing {filtered.length} matching {filtered.length === 1 ? 'record' : 'records'}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-600">
              {filtered.length} {filtered.length === 1 ? 'row' : 'rows'}
            </span>
          </div>
          <div className="min-h-[45vh] max-h-[66vh] overflow-auto">
            <table className="w-full border-collapse text-left text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-xs">
                <tr>
                  {columns[kind].map((column) => (
                    <th
                      key={column.key}
                      className={`px-2.5 py-2.5 ${
                        isNumericColumn(kind, column.key) ? 'text-right whitespace-nowrap' : 'whitespace-nowrap'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="sticky right-0 bg-slate-50 px-2.5 py-2.5 text-right whitespace-nowrap shadow-[-6px_0_10px_-6px_rgba(15,23,42,0.1)]">
                    Export
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length ? (
                  filtered.map((row, index) => (
                    <tr key={get(row, 'id') || kind + index} className="group hover:bg-slate-50/80 transition-colors">
                      {columns[kind].map((column) => {
                        const rawVal = row[column.key];
                        const value = String(rawVal ?? '');
                        const location = value as AttendanceWorkLocation;

                        let cellText = value || '—';
                        if (kind === 'attendance' && column.key === 'categoryName') {
                          cellText = workLocationLabels[location] || 'Unspecified';
                        } else if (column.key === 'createdAt') {
                          cellText = dateTimeLabel(rawVal);
                        } else if (column.key.toLowerCase().includes('date') && !column.key.toLowerCase().includes('update')) {
                          cellText = dateLabel(rawVal);
                        } else if (isMoneyColumn(kind, column.key)) {
                          const num = Number(rawVal);
                          cellText = kind === 'financial' && column.key === 'budget' && num === 0
                            ? '—'
                            : Number.isFinite(num)
                              ? formatMoneyUi(num)
                              : value || '—';
                        } else if (column.key === 'status' && value) {
                          cellText = formatLabel(value);
                        }

                        const isStatus = column.key === 'status' || column.key === 'priority';
                        const isLocationChip = kind === 'attendance' && column.key === 'categoryName';
                        const isNum = isNumericColumn(kind, column.key);
                        const isTruncated = isTruncatedColumn(column.key);

                        return (
                          <td
                            key={column.key}
                            title={cellText !== '—' ? cellText : undefined}
                            className={`px-2.5 py-2.5 text-slate-700 ${
                              isNum
                                ? 'text-right font-medium tabular-nums whitespace-nowrap'
                                : isTruncated
                                  ? 'max-w-[165px] truncate'
                                  : 'whitespace-nowrap'
                            }`}
                          >
                            {isStatus && value ? (
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${statusTone(
                                  value,
                                )}`}
                              >
                                {cellText}
                              </span>
                            ) : isLocationChip ? (
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  workLocationTones[location] || workLocationTones.unknown
                                }`}
                              >
                                {cellText}
                              </span>
                            ) : (
                              cellText
                            )}
                          </td>
                        );
                      })}
                      <td className="sticky right-0 bg-white group-hover:bg-slate-50 px-2.5 py-2 text-right whitespace-nowrap shadow-[-6px_0_10px_-6px_rgba(15,23,42,0.08)]">
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            aria-label="Export row as CSV"
                            title="Export this record as CSV"
                            onClick={() => void exportRows('csv', [row])}
                            className="rounded-md bg-teal-50 p-1.5 text-teal-700 hover:bg-teal-100 transition-colors"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void exportRows('pdf', [row])}
                            className="rounded-md bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns[kind].length + 1} className="px-4 py-14 text-center text-sm text-slate-500">
                      {error ? 'Records could not be loaded.' : loading ? 'Refreshing records…' : 'No records match these filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
