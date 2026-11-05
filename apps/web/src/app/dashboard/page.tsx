'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Minus,
  RefreshCw,
  FolderKanban,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { ExportUtils } from '@/lib/exportUtils';
import { getDashboardAudience, getDashboardDataKeys, selectPersonalDashboardData } from '@/lib/dashboardRoleData';
import { PersonalDashboard } from './PersonalDashboard';
import { DateTimeFilter, DateTimeFilterValue } from '@/components/dashboard/DateTimeFilter';

type ChartMode = 'budget' | 'categories' | 'projects';
type ChartStyle = 'donut' | 'pie';
type Period = '6' | '12' | 'year';
type Trend = { percent: number | null; direction: 'up' | 'down' | 'flat'; positiveWhenUp: boolean; text: string } | null;

const money = (amount: number) => `৳${Math.round(amount).toLocaleString()}`;
const COLORS = ['#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#64748b'];

function monthValue(dateValue: unknown, target: Date, throughDay = 31) {
  if (!dateValue) return false;
  const date = new Date(String(dateValue));
  return !Number.isNaN(date.getTime()) && date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth() && date.getDate() <= throughDay;
}

function calculateTrend(current: number, previous: number, positiveWhenUp: boolean, periodLabel: string, hasHistory: boolean): Trend {
  if (!hasHistory) return null;
  const direction = current > previous ? 'up' : current < previous ? 'down' : 'flat';
  const percent = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? null : 0;
  const text = percent === null ? `New ${periodLabel}` : `${percent > 0 ? '+' : ''}${percent}% ${periodLabel}`;
  return { percent, direction, positiveWhenUp, text };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [lastWeekAttendance, setLastWeekAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [dataError, setDataError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChartProjectId, setSelectedChartProjectId] = useState('all');
  const [chartMode, setChartMode] = useState<ChartMode>('budget');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('donut');
  const [period, setPeriod] = useState<Period>('6');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateTimeFilterValue>({
    from: '',
    to: '',
    preset: 'all',
  });
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleResolved, setRoleResolved] = useState(false);
  const loadedIdentity = useRef('');
  const canUpdateTaskStatus = ['main_admin', 'project_manager', 'project_member'].includes(currentUser?.role);

  const fetchData = useCallback(async (silent = false) => {
    if (!currentUser?.role) return;
    if (!silent) setLoading(true);
    try {
      const audience = getDashboardAudience(currentUser.role);
      const isCompanyDashboard = audience === 'company';
      const identity = `${currentUser.id || ''}:${currentUser.role}`;
      if (loadedIdentity.current !== identity) {
        loadedIdentity.current = identity;
        setProjects([]);
        setExpenses([]);
        setAttendance([]);
        setLastWeekAttendance([]);
        setUsers([]);
        setTasks([]);
        setLeaveRequests([]);
      }
      const comparableDay = new Date();
      comparableDay.setDate(comparableDay.getDate() - 7);
      const comparableDate = `${comparableDay.getFullYear()}-${String(comparableDay.getMonth() + 1).padStart(2, '0')}-${String(comparableDay.getDate()).padStart(2, '0')}`;
      const requestByKey: Record<string, () => Promise<any>> = {
        projects: () => ApiClient.getProjects(),
        expenses: () => ApiClient.getExpenses(),
        attendance: () => ApiClient.getAttendance(),
        people: () => ApiClient.getUsers(),
        tasks: () => ApiClient.getTasks(),
        attendanceHistory: () => ApiClient.getAttendance({ date: comparableDate }),
        leaveRequests: () => ApiClient.getLeaves(),
      };
      const dataKeys = getDashboardDataKeys(currentUser.role);
      const requests = dataKeys.map((key) => requestByKey[key]());
      const results = await Promise.allSettled(requests);
      const dataLabels: Record<string, string> = {
        projects: 'projects', expenses: 'expenses', attendance: 'attendance', people: 'team directory',
        tasks: 'tasks', attendanceHistory: 'attendance history', leaveRequests: 'leave requests',
      };
      const errors = results.flatMap((result, index) => result.status === 'rejected' ? [dataLabels[dataKeys[index]]] : []);
      const values = new Map(dataKeys.map((key, index) => [key, results[index]]));
      const valueFor = (key: string) => {
        const result = values.get(key);
        return result?.status === 'fulfilled' ? result.value || [] : undefined;
      };
      if (valueFor('projects') !== undefined) setProjects(valueFor('projects'));
      if (valueFor('expenses') !== undefined) setExpenses(valueFor('expenses'));
      if (isCompanyDashboard) {
        if (valueFor('attendance') !== undefined) setAttendance(valueFor('attendance'));
        if (valueFor('people') !== undefined) setUsers(valueFor('people'));
        if (valueFor('tasks') !== undefined) setTasks(valueFor('tasks'));
        if (valueFor('attendanceHistory') !== undefined) setLastWeekAttendance(valueFor('attendanceHistory'));
        if (valueFor('leaveRequests') !== undefined) setLeaveRequests(valueFor('leaveRequests'));
      } else {
        setAttendance([]);
        setLastWeekAttendance([]);
        setUsers([]);
        setTasks([]);
        setLeaveRequests([]);
      }
      setDataError(errors.length ? `Live data unavailable for ${errors.join(', ')}.` : '');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError('Dashboard live data could not be refreshed.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser?.role]);

  const updateDashboardTaskStatus = async (task: any, status: 'todo' | 'in_progress' | 'completed') => {
    if (!canUpdateTaskStatus) return;
    const previousTask = tasks.find((item) => item.id === task.id);
    setUpdatingTaskId(task.id);
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item));
    try {
      const saved = await ApiClient.updateTaskStatus(task.id, status);
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, ...saved } : item));
      notifyAction('Task status updated.');
    } catch (error) {
      setTasks((current) => current.map((item) => item.id === task.id ? previousTask : item));
      notifyAction(error instanceof Error ? error.message : 'Task status could not be saved.', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const storedUser = localStorage.getItem('gw_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    } catch {
      // Keep the user signed out if stored profile data is invalid.
    } finally {
      setRoleResolved(true);
    }
  }, []);

  useEffect(() => {
    if (!roleResolved || !currentUser?.role) {
      setLoading(false);
      return;
    }
    void fetchData();
    const unsubscribe = ApiClient.subscribeToDataRefresh(() => { void fetchData(true); });
    return unsubscribe;
  }, [roleResolved, currentUser?.role, fetchData]);

  const fromTimestamp = useMemo(() => (dateRange.from ? new Date(dateRange.from).getTime() : null), [dateRange.from]);
  const toTimestamp = useMemo(() => (dateRange.to ? new Date(dateRange.to).getTime() : null), [dateRange.to]);
  const isTimeFiltered = fromTimestamp !== null || toTimestamp !== null;

  const filteredProjects = useMemo(() => {
    if (!isTimeFiltered) return projects;
    return projects.filter((project) => {
      const start = project.startDate || project.start_date || project.createdAt || project.created_at;
      const end = project.endDate || project.end_date;
      const sTime = start ? new Date(start).getTime() : null;
      const eTime = end ? new Date(end).getTime() : null;
      if (sTime !== null && eTime !== null) {
        if (fromTimestamp !== null && toTimestamp !== null) return sTime <= toTimestamp && eTime >= fromTimestamp;
        if (fromTimestamp !== null) return eTime >= fromTimestamp;
        if (toTimestamp !== null) return sTime <= toTimestamp;
      }
      if (sTime !== null) {
        if (fromTimestamp !== null && toTimestamp !== null) return sTime >= fromTimestamp && sTime <= toTimestamp;
        if (fromTimestamp !== null) return sTime >= fromTimestamp;
        if (toTimestamp !== null) return sTime <= toTimestamp;
      }
      return true;
    });
  }, [projects, isTimeFiltered, fromTimestamp, toTimestamp]);

  const filteredExpenses = useMemo(() => {
    if (!isTimeFiltered) return expenses;
    return expenses.filter((expense) => {
      const raw = expense.date || expense.createdAt || expense.created_at;
      if (!raw) return true;
      const t = new Date(raw).getTime();
      if (fromTimestamp !== null && t < fromTimestamp) return false;
      if (toTimestamp !== null && t > toTimestamp) return false;
      return true;
    });
  }, [expenses, isTimeFiltered, fromTimestamp, toTimestamp]);

  const filteredAttendance = useMemo(() => {
    if (!isTimeFiltered) return attendance;
    return attendance.filter((record) => {
      const raw = record.date || record.attendanceDate || record.attendance_date || record.createdAt || record.checkInTime || record.check_in_time || record.loginTime;
      if (!raw) return true;
      const t = new Date(raw).getTime();
      if (fromTimestamp !== null && t < fromTimestamp) return false;
      if (toTimestamp !== null && t > toTimestamp) return false;
      return true;
    });
  }, [attendance, isTimeFiltered, fromTimestamp, toTimestamp]);

  const filteredTasks = useMemo(() => {
    if (!isTimeFiltered) return tasks;
    return tasks.filter((task) => {
      const raw = task.dueDate || task.due_date || task.createdAt || task.created_at;
      if (!raw) return true;
      const t = new Date(raw).getTime();
      if (fromTimestamp !== null && t < fromTimestamp) return false;
      if (toTimestamp !== null && t > toTimestamp) return false;
      return true;
    });
  }, [tasks, isTimeFiltered, fromTimestamp, toTimestamp]);

  const filteredLeaveRequests = useMemo(() => {
    if (!isTimeFiltered) return leaveRequests;
    return leaveRequests.filter((leave) => {
      const start = leave.startDate || leave.start_date || leave.createdAt;
      const end = leave.endDate || leave.end_date || start;
      const sTime = start ? new Date(start).getTime() : null;
      const eTime = end ? new Date(end).getTime() : null;
      if (sTime !== null && eTime !== null) {
        if (fromTimestamp !== null && toTimestamp !== null) return sTime <= toTimestamp && eTime >= fromTimestamp;
        if (fromTimestamp !== null) return eTime >= fromTimestamp;
        if (toTimestamp !== null) return sTime <= toTimestamp;
      }
      if (sTime !== null) {
        if (fromTimestamp !== null && toTimestamp !== null) return sTime >= fromTimestamp && sTime <= toTimestamp;
        if (fromTimestamp !== null) return sTime >= fromTimestamp;
        if (toTimestamp !== null) return sTime <= toTimestamp;
      }
      return true;
    });
  }, [leaveRequests, isTimeFiltered, fromTimestamp, toTimestamp]);

  const approvedExpenses = useMemo(
    () => filteredExpenses.filter((expense) => String(expense.status || '').toLowerCase() === 'approved'),
    [filteredExpenses]
  );
  const pendingExpenses = useMemo(
    () => filteredExpenses.filter((expense) => String(expense.status || '').toLowerCase() === 'pending'),
    [filteredExpenses]
  );
  const pendingLeaves = useMemo(() => filteredLeaveRequests
    .filter((leave) => String(leave.status || (leave.isApproved || leave.is_approved ? 'approved' : 'pending')).toLowerCase() === 'pending')
    .slice(0, 4), [filteredLeaveRequests]);
  const chartProject = useMemo(
    () => (selectedChartProjectId === 'all' ? null : filteredProjects.find((project) => project.id === selectedChartProjectId) || null),
    [filteredProjects, selectedChartProjectId]
  );

  const totalBudget = filteredProjects.reduce((sum, project) => sum + Number(project.budget || project.grossProjectValue || 0), 0);
  const totalSpent = approvedExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const percentSpent = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const presentTeam = useMemo(() => {
    const unique = new Map<string, any>();
    filteredAttendance.forEach((record) => {
      const id = String(record.userId || record.user_id || record.userName || record.user_name || 'staff');
      const name = record.userName || record.user_name || 'Staff member';
      const user = users.find((candidate) => candidate.id === id || candidate.id === record.userId || candidate.id === record.user_id);
      if (!unique.has(id)) {
        unique.set(id, {
          id,
          name,
          avatar: record.userAvatar || record.user_avatar || record.avatarUrl || record.avatar_url || user?.avatarUrl || user?.avatar_url,
        });
      }
    });
    return Array.from(unique.values());
  }, [filteredAttendance, users]);

  const today = new Date();
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const dayThrough = today.getDate();
  const projectCreatedAt = (project: any) => project.createdAt || project.created_at;
  const expenseOccurredAt = (expense: any) => expense.date || expense.createdAt || expense.created_at;
  const expenseSubmittedAt = (expense: any) => expense.createdAt || expense.created_at;
  const projectsHaveCreationHistory = projects.length > 0 && projects.every((project) => Boolean(projectCreatedAt(project)));
  const expensesHaveDateHistory = expenses.length > 0 && expenses.every((expense) => Boolean(expenseOccurredAt(expense)));
  const expensesHaveSubmissionHistory = expenses.length > 0 && expenses.every((expense) => Boolean(expenseSubmittedAt(expense)));
  const currentMonthProjects = projects.filter((project) => monthValue(projectCreatedAt(project), thisMonthStart, dayThrough));
  const previousMonthProjects = projects.filter((project) => monthValue(projectCreatedAt(project), previousMonthStart, dayThrough));
  const currentMonthClaims = expenses.filter((expense) => monthValue(expenseSubmittedAt(expense), thisMonthStart, dayThrough)).length;
  const previousMonthClaims = expenses.filter((expense) => monthValue(expenseSubmittedAt(expense), previousMonthStart, dayThrough)).length;
  const monthlyApprovedSpend = (targetMonth: Date) => approvedExpenses
    .filter((expense) => monthValue(expenseOccurredAt(expense), targetMonth, dayThrough))
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const currentMonthSpend = monthlyApprovedSpend(thisMonthStart);
  const previousMonthSpend = monthlyApprovedSpend(previousMonthStart);
  const lastWeekPresentCount = new Set(lastWeekAttendance.map((record) => String(record.userId || record.user_id || record.userName || record.user_name))).size;
  const trends = {
    projects: calculateTrend(currentMonthProjects.length, previousMonthProjects.length, true, 'MTD', projectsHaveCreationHistory),
    // The API has no budget change history, so a budget delta cannot be derived honestly.
    budget: null,
    approvals: calculateTrend(currentMonthClaims, previousMonthClaims, false, 'MTD', expensesHaveSubmissionHistory),
    attendance: calculateTrend(presentTeam.length, lastWeekPresentCount, true, 'vs last week', true),
    spent: calculateTrend(currentMonthSpend, previousMonthSpend, false, 'MTD', expensesHaveDateHistory),
    remaining: expensesHaveDateHistory && currentMonthSpend > 0
      ? { percent: null, direction: 'down' as const, positiveWhenUp: true, text: `−${money(currentMonthSpend)} MTD` }
      : expensesHaveDateHistory
        ? { percent: null, direction: 'flat' as const, positiveWhenUp: true, text: 'No spend MTD' }
        : null,
  };

  const chartExpenses = useMemo(() => chartProject
    ? approvedExpenses.filter((expense) =>
        (expense.projectId || expense.project_id) === chartProject.id || expense.projectName === chartProject.name)
    : approvedExpenses,
  [approvedExpenses, chartProject]);
  const chartBudget = chartProject
    ? Number(chartProject.budget || chartProject.grossProjectValue || 0)
    : filteredProjects.reduce((sum, project) => sum + Number(project.budget || project.grossProjectValue || 0), 0);
  const chartSpent = chartExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const chartRemaining = Math.max(0, chartBudget - chartSpent);
  const chartPercentSpent = chartBudget ? Math.round((chartSpent / chartBudget) * 100) : 0;

  const budgetPieData = [
    { name: 'Spent', value: chartSpent, color: '#f59e0b' },
    { name: 'Available', value: chartRemaining, color: '#10b981' },
  ];
  const categoryPieData = useMemo(() => {
    const aliases: Record<string, string> = {
      transport: 'Transportation', transportation: 'Transportation',
      food: 'Food & meals', meals: 'Food & meals', foodandmeals: 'Food & meals',
      accommodation: 'Accommodation', lodging: 'Accommodation', hotel: 'Accommodation',
      equipment: 'Equipment', office: 'Office cost', officecost: 'Office cost',
      consulting: 'Consultancy', consultancy: 'Consultancy',
    };
    const totals = new Map<string, number>();
    chartExpenses.forEach((expense) => {
      const raw = String(expense.categoryName || expense.category || 'General');
      const key = raw.toLowerCase().replace(/[^a-z]/g, '');
      const category = aliases[key] || raw.replace(/([A-Z])/g, ' $1').trim();
      totals.set(category, (totals.get(category) || 0) + (Number(expense.amount) || 0));
    });
    return Array.from(totals, ([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
      .filter((entry) => entry.value > 0).sort((a, b) => b.value - a.value);
  }, [chartExpenses]);
  const projectPieData = useMemo(() => {
    if (chartProject) {
      const selected = Number(chartProject.budget || chartProject.grossProjectValue || 0);
      const portfolio = filteredProjects.reduce((sum, project) => sum + Number(project.budget || project.grossProjectValue || 0), 0);
      return [
        { name: chartProject.name, value: selected, color: '#0ea5e9' },
        { name: 'Other projects', value: Math.max(0, portfolio - selected), color: '#cbd5e1' },
      ].filter((entry) => entry.value > 0);
    }
    return filteredProjects.map((project, index) => ({
      name: project.name,
      value: Number(project.budget || project.grossProjectValue || 0),
      color: COLORS[(index + 1) % COLORS.length],
    })).filter((entry) => entry.value > 0);
  }, [chartProject, filteredProjects]);
  const selectedPieData = chartMode === 'budget' ? budgetPieData : chartMode === 'categories' ? categoryPieData : projectPieData;

  const cashFlowData = useMemo(() => {
    const now = new Date();
    const count = period === 'year' ? now.getMonth() + 1 : Number(period);
    const start = new Date(now.getFullYear(), period === 'year' ? 0 : now.getMonth() - count + 1, 1);
    const months = Array.from({ length: count }, (_, index) => new Date(start.getFullYear(), start.getMonth() + index, 1));
    const values = new Map(months.map((date) => [`${date.getFullYear()}-${date.getMonth()}`, { inflow: 0, outflow: 0 }]));
    const trendExpenses = chartProject
      ? approvedExpenses.filter((expense) =>
          (expense.projectId || expense.project_id) === chartProject.id || expense.projectName === chartProject.name)
      : approvedExpenses;
    trendExpenses.forEach((expense) => {
      const rawDate = expense.date || expense.createdAt || expense.created_at;
      if (!rawDate) return;
      const date = new Date(rawDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = values.get(key);
      if (month) month.outflow += Number(expense.amount) || 0;
    });
    const revenueProjects = chartProject ? [chartProject] : filteredProjects;
    revenueProjects.forEach((project) => (project.revenueEntries || []).forEach((revenue: any) => {
      const date = new Date(revenue.date);
      if (Number.isNaN(date.getTime())) return;
      if (fromTimestamp !== null && date.getTime() < fromTimestamp) return;
      if (toTimestamp !== null && date.getTime() > toTimestamp) return;
      const month = values.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (month) month.inflow += Number(revenue.amount) || 0;
    }));
    return months.map((date) => ({
      month: date.toLocaleDateString('en', { month: 'short' }),
      ...values.get(`${date.getFullYear()}-${date.getMonth()}`),
    }));
  }, [approvedExpenses, chartProject, period, filteredProjects, fromTimestamp, toTimestamp]);

  const projectRows = useMemo(() => filteredProjects.filter((project) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return String(project.name || '').toLowerCase().includes(query) || String(project.client || '').toLowerCase().includes(query);
  }), [filteredProjects, search]);
  const approvalRows = useMemo(() => pendingExpenses.filter((expense) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return String(expense.employeeName || expense.employee_name || expense.categoryName || expense.category || '').toLowerCase().includes(query);
  }).slice(0, 5), [pendingExpenses, search]);
  const deadlineRows = useMemo(() => filteredTasks
    .filter((task) => task.dueDate || task.due_date)
    .filter((task) => String(task.status || '').toLowerCase() !== 'completed')
    .filter((task) => !search || String(task.title || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.dueDate || a.due_date).getTime() - new Date(b.dueDate || b.due_date).getTime())
    .slice(0, 5), [filteredTasks, search]);
  const searchResults = useMemo(() => {
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const matches = (value: string) => terms.every((term) => value.toLowerCase().includes(term));
    return [
      ...filteredProjects.filter((project) => matches(`${project.name || ''} ${project.client || ''}`)).map((project) => ({
        key: `project-${project.id}`, label: project.name, meta: 'Project', href: `/projects/${project.id}`,
      })),
      ...filteredTasks.filter((task) => matches(`${task.title || ''} ${task.projectName || ''}`)).map((task) => ({
        key: `task-${task.id}`, label: task.title || 'Task', meta: 'Task', href: '/tasks',
      })),
      ...filteredExpenses.filter((expense) => matches(`${expense.categoryName || ''} ${expense.employeeName || ''} ${expense.projectName || ''}`)).map((expense) => ({
        key: `expense-${expense.id}`, label: expense.categoryName || 'Expense', meta: expense.status === 'pending' ? 'Approval' : 'Expense', href: expense.status === 'pending' ? '/approvals' : '/expenses',
      })),
    ].slice(0, 7);
  }, [search, filteredProjects, filteredTasks, filteredExpenses]);

  const exportDashboard = () => {
    const rows = filteredProjects.map((project) => {
      const projectExpenses = approvedExpenses.filter((expense) =>
        (expense.projectId || expense.project_id) === project.id || expense.projectName === project.name);
      const spent = projectExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
      const budget = Number(project.budget || project.grossProjectValue || 0);
      return { Project: project.name, Client: project.client || 'Direct', Budget: budget, Spent: spent, Remaining: Math.max(0, budget - spent), Status: project.status || 'Ongoing' };
    });
    ExportUtils.exportToExcel(rows, 'GeospatialWorks_Dashboard_Summary');
  };

  const greetingName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Admin';
  const todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const attendancePercent = users.length ? Math.min(100, Math.round((presentTeam.length / users.length) * 100)) : 0;

  const audience = getDashboardAudience(currentUser?.role);
  const personalData = currentUser?.id
    ? selectPersonalDashboardData(String(currentUser.id), projects, expenses)
    : { projects: [], expenses: [], personalExpenses: [] };

  if (!roleResolved) {
    return <AdminLayout hideTopNav noScroll contentClassName="flex min-h-0 flex-1 items-start justify-center px-5 pt-12"><p className="text-sm text-slate-500">Preparing your dashboard…</p></AdminLayout>;
  }

  if (!currentUser) {
    return <AdminLayout hideTopNav noScroll contentClassName="flex min-h-0 flex-1 items-start justify-center px-5 pt-12"><p className="text-sm text-slate-500">Sign in to view your dashboard.</p></AdminLayout>;
  }

  if (audience === 'member' || audience === 'viewer') {
    return <PersonalDashboard
      currentUser={currentUser}
      projects={personalData.projects}
      expenses={personalData.expenses}
      personalExpenses={personalData.personalExpenses}
      loading={loading}
      dataError={dataError}
      onRefresh={() => void fetchData()}
      onUserUpdate={setCurrentUser}
      viewer={audience === 'viewer'}
    />;
  }

  return (
    <AdminLayout hideTopNav noScroll contentClassName="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4 pt-4 xl:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="relative z-30 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Good morning, {greetingName}</h1>
            <p className="mt-0.5 text-xs text-slate-500">Here&apos;s what&apos;s happening across your projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <DateTimeFilter
              value={dateRange}
              onChange={setDateRange}
            />

            <div className="group relative hidden sm:block">
              <Search size={15} className="pointer-events-none absolute left-3 top-[18px] -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setSearch(''); }} placeholder="Search" aria-label="Search dashboard" className="h-9 w-48 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-[18px] -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={14} /></button>}
              {search.trim() && <div className="absolute right-0 top-10 z-50 hidden w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg group-focus-within:block" aria-label="Search results">
                {searchResults.length ? searchResults.map((result) => <Link key={result.key} href={result.href} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-slate-50"><span className="truncate font-medium text-slate-800">{result.label}</span><span className="shrink-0 text-[10px] text-slate-400">{result.meta}</span></Link>) : <p className="px-3 py-3 text-xs text-slate-500">No matches</p>}
              </div>}
            </div>

            <button type="button" onClick={() => void fetchData()} aria-label="Refresh dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button>
            <button type="button" onClick={exportDashboard} aria-label="Export dashboard" className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:flex"><Receipt size={15} /></button>
            <NotificationPanel />
            <ProfileDropdown currentUser={currentUser} onUserUpdate={setCurrentUser} />
            <Link href="/projects/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-700"><Plus size={15} />New project</Link>
          </div>
        </header>

        {isTimeFiltered && (
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs text-indigo-900">
            <span className="flex items-center gap-1.5 font-medium">
              <CalendarDays size={13} className="text-indigo-600" />
              Showing filtered data for selected time window ({filteredProjects.length} projects, {filteredExpenses.length} expenses)
            </span>
            <button
              type="button"
              onClick={() => setDateRange({ from: '', to: '', preset: 'all' })}
              className="font-semibold text-indigo-700 underline hover:text-indigo-900"
            >
              Reset to all time
            </button>
          </div>
        )}

        {dataError && <div role="alert" className="flex shrink-0 items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><span>{dataError}</span><button type="button" onClick={() => void fetchData()} className="font-semibold underline">Retry</button></div>}

        <section className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6" aria-label="Dashboard key metrics">
          <MetricCard label="Active projects" value={filteredProjects.length} detail={`${filteredProjects.length} in workspace`} trend={trends.projects} icon={FolderKanban} tone="indigo" />
          <MetricCard label="Total budget" value={money(totalBudget)} detail="Current allocation" trend={trends.budget} icon={CircleDollarSign} tone="blue" />
          <MetricCard label="Pending approvals" value={pendingExpenses.length} detail={pendingExpenses.length ? 'Needs review' : 'All caught up'} trend={null} icon={Receipt} tone="amber" />
          <MetricCard label="Team present" value={`${presentTeam.length} / ${users.length}`} detail={`${attendancePercent}% attendance today`} trend={trends.attendance} icon={Users} tone="green" />
          <MetricCard label="Total spent" value={money(totalSpent)} detail={`${percentSpent}% spent`} trend={trends.spent} icon={ArrowUpRight} tone="amber" />
          <MetricCard label="Remaining budget" value={money(remainingBudget)} detail={`${Math.max(0, 100 - percentSpent)}% remaining`} trend={null} icon={ShieldCheck} tone="green" />
        </section>

        <section className="grid shrink-0 grid-cols-1 gap-3 xl:grid-cols-12">
          <article className="rounded-xl border border-slate-200 bg-white p-3.5 xl:col-span-8">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div><h2 className="text-sm font-bold text-slate-900">Cash flow</h2><p className="mt-0.5 text-[11px] text-slate-500">Received payments and approved expenses</p></div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500"><i className="h-2 w-2 rounded-full bg-indigo-500" />In</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500"><i className="h-2 w-2 rounded-full bg-sky-200" />Out</span>
                <label className="relative"><span className="sr-only">Cash flow period</span><select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-[11px] font-medium text-slate-700 outline-none focus:border-indigo-300"><option value="12">Last 12 months</option><option value="6">Last 6 months</option><option value="year">This year</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" /></label>
              </div>
            </div>
            <div className="h-[220px] w-full sm:h-[235px]">
              {mounted && <ResponsiveContainer width="100%" height="100%"><ComposedChart data={cashFlowData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} width={54} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(value) => `${value < 0 ? '−' : ''}৳${Math.abs(value) >= 1000 ? `${Math.round(Math.abs(value) / 1000)}k` : Math.abs(value)}`} />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                <Tooltip formatter={(value, name) => [money(Number(value)), name === 'inflow' ? 'Cash in' : 'Cash out']} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11 }} />
                <Bar dataKey="inflow" fill="#4f7df3" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="outflow" fill="#bfdbfe" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </ComposedChart></ResponsiveContainer>}
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 xl:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">Budget health</h2>
              <label className="relative min-w-0 max-w-[170px] flex-1 sm:flex-none">
                <span className="sr-only">Filter budget chart by project</span>
                <select value={selectedChartProjectId} onChange={(event) => setSelectedChartProjectId(event.target.value)} className="h-8 w-full appearance-none truncate rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-[11px] font-medium text-slate-700 outline-none focus:border-indigo-300"><option value="all">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label="Budget health view">
                {(['budget', 'categories', 'projects'] as const).map((mode) => <button key={mode} type="button" onClick={() => setChartMode(mode)} aria-pressed={chartMode === mode} className={`h-7 rounded-md px-2 text-[10px] font-semibold transition ${chartMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{mode === 'budget' ? 'Budget' : mode === 'categories' ? 'Categories' : 'Projects'}</button>)}
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label="Chart style">
                {(['donut', 'pie'] as const).map((style) => <button key={style} type="button" onClick={() => setChartStyle(style)} aria-pressed={chartStyle === style} className={`h-6 rounded-md px-2 text-[10px] font-medium capitalize ${chartStyle === style ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>{style}</button>)}
              </div>
            </div>
            <div className="mt-2 grid min-h-[166px] flex-1 grid-cols-[140px_minmax(0,1fr)] items-center gap-2">
              <div className="relative h-[140px] w-[140px]">
                {mounted && selectedPieData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={selectedPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={chartStyle === 'donut' ? 44 : 0} outerRadius={63} paddingAngle={chartStyle === 'donut' ? 2 : 0} stroke="white" strokeWidth={2} isAnimationActive={false}>{selectedPieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 10 }} /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-full border-8 border-slate-100 text-center text-[10px] text-slate-400">No data</div>}
                {chartStyle === 'donut' && selectedPieData.length > 0 && <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold text-slate-900">{chartMode === 'budget' ? `${chartPercentSpent}%` : selectedPieData.length}</span><span className="text-[10px] text-slate-500">{chartMode === 'budget' ? 'used' : chartMode}</span></div>}
              </div>
              <div className="min-w-0">
                {chartMode === 'budget' ? <>
                  <p className="text-[10px] font-medium text-slate-500">{chartProject?.name || 'Total budget'}</p>
                  <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900">{money(chartBudget)}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${chartPercentSpent >= 90 ? 'bg-rose-50 text-rose-700' : chartPercentSpent >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{chartPercentSpent >= 90 ? 'Review' : chartPercentSpent >= 70 ? 'At risk' : 'On track'}</span>
                  <LegendRow color="#f59e0b" label="Spent" value={money(chartSpent)} />
                  <LegendRow color="#10b981" label="Available" value={money(chartRemaining)} />
                </> : <div className="max-h-[150px] space-y-1 overflow-y-auto pr-1">
                  {selectedPieData.length ? selectedPieData.slice(0, 6).map((entry) => <LegendRow key={entry.name} color={entry.color} label={entry.name} value={money(entry.value)} />) : <p className="text-[10px] text-slate-400">No approved expenses for this view.</p>}
                </div>}
              </div>
            </div>
          </article>
        </section>

        <section className="grid min-h-[340px] flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="flex min-h-[340px] flex-col gap-3">
          <article className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Projects</h2><Link href="/projects" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">View all</Link></div>
            <div className="grid grid-cols-[minmax(0,1fr)_100px_74px] gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[10px] font-medium text-slate-500"><span>Project</span><span>Budget used</span><span>Status</span></div>
            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
              {projectRows.slice(0, 5).map((project) => {
                const budget = Number(project.budget || project.grossProjectValue || 0);
                const spent = approvedExpenses.filter((expense) => (expense.projectId || expense.project_id) === project.id || expense.projectName === project.name).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
                const percent = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
                const status = percent >= 90 ? 'At risk' : 'On track';
                return <Link href={`/projects/${project.id}`} key={project.id} className="grid w-full grid-cols-[minmax(0,1fr)_100px_74px] items-center gap-2 px-2.5 py-2.5 text-left transition hover:bg-slate-50">
                  <span className="flex min-w-0 items-center gap-2"><UserAvatar src={project.imageUrl || project.image_url || project.thumbnailUrl || project.thumbnail_url} name={project.name} size="sm" shape="rounded" className="shrink-0" /><span className="min-w-0"><span className="block truncate text-[11px] font-semibold text-slate-800">{project.name}</span><span className="block truncate text-[9px] text-slate-400">{project.client || 'Direct client'}</span></span></span>
                  <span className="min-w-0"><span className="flex items-center gap-1 text-[9px] text-slate-500">{percent}% <span className="truncate">{money(spent)}</span></span><span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${percent >= 90 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} /></span></span>
                  <span className={`justify-self-start rounded-full px-2 py-1 text-[9px] font-semibold ${status === 'At risk' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{status}</span>
                </Link>;
              })}
              {projectRows.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No matching projects.</p>}
            </div>
          </article>
          <article className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 -space-x-2" aria-label={`${presentTeam.length} team members present`}>
                {presentTeam.slice(0, 5).map((member) => <UserAvatar key={member.id} src={member.avatar} name={member.name} size="sm" shape="circle" className="border-2 border-white" />)}
                {presentTeam.length > 5 && <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-600">+{presentTeam.length - 5}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-slate-800">Team present <span className="text-slate-500">{presentTeam.length}/{users.length}</span></span><Link href="/attendance" className="shrink-0 text-[10px] font-semibold text-indigo-600">View attendance</Link></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${attendancePercent}%` }} /></div>
                <p className="mt-0.5 text-[9px] text-slate-400">{attendancePercent}% attendance today</p>
              </div>
            </div>
          </article>
          </div>

          <article className="flex min-h-[300px] flex-col rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Approvals</h2><Link href="/approvals" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">View all</Link></div>
            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
              {approvalRows.map((expense) => {
                const approvalUser = users.find((user) => user.id === (expense.employeeId || expense.employee_id));
                const approvalName = expense.employeeName || expense.employee_name || approvalUser?.fullName || approvalUser?.name || 'Team member';
                const approvalAvatar = expense.employeeAvatar || expense.employee_avatar || expense.employeeAvatarUrl || expense.employee_avatar_url || expense.avatarUrl || expense.avatar_url || approvalUser?.avatarUrl || approvalUser?.avatar_url;
                return <Link key={expense.id} href="/approvals" className="flex items-center gap-2.5 py-3 hover:bg-slate-50">
                <UserAvatar src={approvalAvatar} name={approvalName} size="sm" shape="circle" className="shrink-0" />
                <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-slate-800">{expense.categoryName || expense.category || 'Expense claim'}</span><span className="block truncate text-[10px] text-slate-500">{approvalName}</span></span>
                <span className="shrink-0 text-right"><span className="block text-[11px] font-semibold text-slate-800">{money(Number(expense.amount) || 0)}</span><span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700">Pending</span></span>
              </Link>;
              })}
              {pendingLeaves.map((leave) => {
                const leaveUser = users.find((user) => user.id === (leave.userId || leave.user_id));
                const leaveName = leave.userName || leave.full_name || leaveUser?.fullName || leaveUser?.name || 'Team member';
                return <Link key={`leave-${leave.id}`} href="/leaves" className="flex items-center gap-2.5 border-t border-slate-100 py-3 hover:bg-slate-50">
                  <UserAvatar src={leave.avatarUrl || leaveUser?.avatarUrl || leaveUser?.avatar_url} name={leaveName} size="sm" shape="circle" className="shrink-0" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-slate-800">{leave.leaveType || 'Leave'} request</span><span className="block truncate text-[10px] text-slate-500">{leaveName} · {leave.startDate || leave.start_date}</span></span>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-medium text-amber-700">Review</span>
                </Link>;
              })}
              {approvalRows.length === 0 && pendingLeaves.length === 0 && <div className="flex h-full min-h-[120px] items-center justify-center gap-2 text-xs text-slate-500"><CheckCircle2 size={16} className="text-emerald-500" />No pending approvals</div>}
            </div>
          </article>

          <article className="flex min-h-[300px] flex-col rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">{currentUser?.role === 'project_member' ? 'My tasks' : 'Upcoming deadlines'}</h2><Link href="/tasks" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">View all</Link></div>
            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
              {deadlineRows.map((task) => {
                const due = new Date(task.dueDate || task.due_date);
                const days = Math.ceil((new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
                const dueLabel = days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days} days`;
                const taskStatus = ['todo', 'in_progress', 'completed'].includes(task.status) ? task.status : 'todo';
                return <div key={task.id} className="flex items-center gap-2.5 py-3">
                  <span className="flex h-9 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-500"><span className="text-[8px] font-semibold uppercase">{due.toLocaleDateString('en', { month: 'short' })}</span><span className="text-xs font-bold text-slate-700">{due.getDate()}</span></span>
                  <span className="min-w-0 flex-1"><Link href="/tasks" className="block truncate text-[11px] font-semibold text-slate-800 hover:text-indigo-700">{task.title || 'Task deadline'}</Link><span className="block truncate text-[10px] text-slate-500">{task.projectName || task.project_name || projects.find((project) => project.id === (task.projectId || task.project_id))?.name || 'Project task'}</span></span>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${days <= 2 ? 'bg-rose-50 text-rose-700' : days <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{dueLabel}</span>
                  {canUpdateTaskStatus && <>
                    <label className="sr-only" htmlFor={`dashboard-task-status-${task.id}`}>Update status for {task.title}</label>
                    <select id={`dashboard-task-status-${task.id}`} value={taskStatus} disabled={updatingTaskId === task.id} onChange={(event) => void updateDashboardTaskStatus(task, event.target.value as 'todo' | 'in_progress' | 'completed')} className="h-7 max-w-[104px] rounded-md border border-slate-200 bg-white px-1.5 text-[9px] font-medium text-slate-700 disabled:opacity-50"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>
                  </>}
                </div>;
              })}
              {deadlineRows.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No upcoming deadlines.</p>}
            </div>
          </article>
        </section>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value, detail, trend, icon: Icon, tone }: { label: string; value: string | number; detail: string; trend: Trend; icon: React.ElementType; tone: 'indigo' | 'blue' | 'amber' | 'green' }) {
  const toneClass = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
  }[tone];
  const isPositive = trend ? (trend.direction === 'flat' || (trend.direction === 'up') === trend.positiveWhenUp) : null;
  const TrendIcon = trend?.direction === 'down' ? ArrowDownRight : trend?.direction === 'flat' ? Minus : ArrowUpRight;
  // Keep trend indicators readable without aggressive red warning arrows.
  const trendTone = isPositive === null ? 'text-slate-400' : isPositive ? 'text-emerald-700' : 'text-slate-500';
  return <article className="flex min-h-[62px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${toneClass}`}><Icon size={14} /></span>
    <div className="min-w-0 flex-1"><p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="truncate text-sm font-bold tracking-tight text-slate-900">{value}</p><div className="flex min-w-0 items-center gap-1"><span className="shrink-0 text-[9px] font-semibold text-slate-500">{detail}</span>{trend && <><TrendIcon size={11} className={`shrink-0 ${trendTone}`} /><span className={`truncate text-[9px] font-semibold ${trendTone}`}>{trend.text}</span></>}</div></div>
  </article>;
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[10px]"><span className="flex min-w-0 items-center gap-1.5 text-slate-600"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} /><span className="truncate">{label}</span></span><span className="shrink-0 font-semibold text-slate-800">{value}</span></div>;
}
