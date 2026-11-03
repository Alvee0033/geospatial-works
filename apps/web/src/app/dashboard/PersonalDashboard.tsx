'use client';

import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, FolderKanban, Receipt, RefreshCw, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { money, summarizeMemberExpenses } from '@/lib/dashboardRoleData';

type RecordData = Record<string, unknown> & {
  id?: string;
  firstName?: string;
  name?: string;
  role?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  client?: string;
  categoryName?: string;
  category_name?: string;
  category?: string;
  projectName?: string;
  project_name?: string;
  employeeId?: string;
  employee_id?: string;
  projectId?: string;
  project_id?: string;
  amount?: number | string;
  status?: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
  hasReceipt?: boolean;
  has_receipt?: boolean;
  receiptPhotoUrl?: string | null;
  receipt_photo_url?: string | null;
};

type PersonalDashboardProps = {
  currentUser: RecordData;
  projects: RecordData[];
  expenses: RecordData[];
  personalExpenses: RecordData[];
  loading: boolean;
  dataError: string;
  onRefresh: () => void;
  onUserUpdate: (user: RecordData) => void;
  viewer?: boolean;
};

const amountOf = (expense: RecordData) => Number(expense.amount) || 0;
const expenseDate = (expense: RecordData): string | null => expense.date || expense.createdAt || expense.created_at || null;
const hasReceipt = (expense: RecordData) => Boolean(
  expense.hasReceipt ?? expense.has_receipt ?? expense.receiptPhotoUrl ?? expense.receipt_photo_url,
);

function monthlySpending(expenses: RecordData[]) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const periods = [
    { start: 1, end: 6 }, { start: 7, end: 12 }, { start: 13, end: 18 },
    { start: 19, end: 24 }, { start: 25, end: daysInMonth },
  ];
  const values = periods.map((period) => ({ month: `${period.start}–${period.end}`, amount: 0 }));
  expenses.forEach((expense) => {
    if (String(expense.status || '').toLowerCase() !== 'approved' || !expenseDate(expense)) return;
    const occurred = new Date(String(expenseDate(expense)));
    if (occurred.getFullYear() !== now.getFullYear() || occurred.getMonth() !== now.getMonth()) return;
    const index = Math.min(4, Math.floor((occurred.getDate() - 1) / 6));
    values[index].amount += amountOf(expense);
  });
  return values;
}

export function PersonalDashboard(props: PersonalDashboardProps) {
  const { currentUser, projects, expenses, personalExpenses, viewer = false } = props;
  const displayName = currentUser.firstName || currentUser.name?.split(' ')[0] || 'there';
  const title = viewer ? 'Your permitted workspace' : 'Your workspace';
  const approvedSpend = expenses.filter((expense) => String(expense.status || '').toLowerCase() === 'approved')
    .reduce((sum, expense) => sum + amountOf(expense), 0);

  return (
    <AdminLayout hideTopNav noScroll contentClassName="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8 pt-5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{title}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Hello, {displayName}</h1>
            <p className="mt-1 text-sm text-slate-500">Your claims, spending, and assigned projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:inline-flex">
              <CalendarDays size={14} className="text-slate-400" />
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button type="button" onClick={props.onRefresh} aria-label="Refresh your dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <RefreshCw size={15} className={props.loading ? 'animate-spin' : ''} />
            </button>
            <NotificationPanel />
            <ProfileDropdown currentUser={currentUser} onUserUpdate={props.onUserUpdate} />
          </div>
        </header>

        {viewer && <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"><ShieldCheck size={17} />Read-only access to your permitted project information.</div>}
        {props.dataError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"><span>{props.dataError}</span><button type="button" onClick={props.onRefresh} className="font-semibold underline">Retry</button></div>}

        {!viewer && <MemberDashboardContent
          loading={props.loading}
          projects={projects}
          expenses={expenses}
          personalExpenses={personalExpenses}
          approvedSpend={approvedSpend}
        />}
        {viewer && <ViewerDashboardContent loading={props.loading} projects={projects} expenses={expenses} />}
      </div>
    </AdminLayout>
  );
}

function MemberDashboardContent({ loading, projects, expenses, personalExpenses, approvedSpend }: {
  loading: boolean;
  projects: RecordData[];
  expenses: RecordData[];
  personalExpenses: RecordData[];
  approvedSpend: number;
}) {
  const receiptSummary = summarizeMemberExpenses(personalExpenses);
  const chartData = monthlySpending(expenses);
  const recentExpenses = [...expenses].sort((left, right) => {
    const leftTime = new Date(expenseDate(left) || 0).getTime();
    const rightTime = new Date(expenseDate(right) || 0).getTime();
    return rightTime - leftTime;
  }).slice(0, 4);

  if (loading) return <DashboardLoading />;

  return <>
    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <article className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 p-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-indigo-100">My Total Submitted Claims</p>
          <Receipt size={18} className="text-indigo-100" />
        </div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight">{money(approvedSpend)}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <HeroStat label="Unreceipted" value={`${receiptSummary.unreceiptedRatio}%`} />
          <HeroStat label="Receipted" value={`${receiptSummary.receiptedRatio}%`} />
          <HeroStat label="Projects" value={`${projects.length} assigned`} />
        </div>
        <Link href="/expenses" className="mt-4 inline-flex rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25">View my expenses</Link>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <div><h2 className="text-sm font-bold text-slate-900">Monthly spending</h2><p className="mt-1 text-xs text-slate-500">Approved expenses · {new Date().toLocaleDateString('en', { month: 'long' })}</p></div>
          <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><FolderKanban size={16} /></span>
        </div>
        <div className="h-36 w-full">
          {chartData.some((point) => point.amount > 0) ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="memberSpendingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(value) => value >= 1000 ? `৳${Math.round(value / 1000)}k` : `৳${value}`} />
            <Tooltip formatter={(value) => [money(Number(value)), 'Approved spend']} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 11 }} />
            <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} fill="url(#memberSpendingFill)" />
          </AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">No approved spending in this period</div>}
        </div>
      </article>
    </section>

    {receiptSummary.highReceiptRisk && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
      <span><strong>Receipt compliance needs attention.</strong> {money(receiptSummary.unreceiptedAmount)} of your claims has no receipt.</span>
      <Link href="/expenses" className="font-semibold text-rose-700 underline">View claims</Link>
    </div>}

    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Receipt compliance</h2><p className="mt-1 text-xs text-slate-500">Based on your submitted claims</p></div><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><ShieldCheck size={16} /></span></div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <ComplianceMetric label="Claimed" value={money(receiptSummary.claimedTotal)} />
          <ComplianceMetric label="Without receipt" value={money(receiptSummary.unreceiptedAmount)} tone="amber" />
          <ComplianceMetric label="Receipted" value={`${receiptSummary.receiptedRatio}%`} tone="green" />
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">My assigned projects</h2><p className="mt-1 text-xs text-slate-500">Projects assigned to your profile</p></div><span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{projects.length}</span></div>
        <div className="mt-3 divide-y divide-slate-100">
          {projects.slice(0, 4).map((project) => <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center gap-3 py-2.5 hover:bg-slate-50">
            <UserAvatar src={project.imageUrl || project.image_url || project.thumbnailUrl || project.thumbnail_url} name={project.name || 'Project'} size="sm" shape="rounded" />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{project.name || 'Project'}</span><span className="block truncate text-xs text-slate-500">{project.client || 'Assigned project'}</span></span>
            <span className="text-xs font-semibold text-indigo-600">Open</span>
          </Link>)}
          {!projects.length && <p className="py-6 text-center text-sm text-slate-500">No projects are assigned to you yet.</p>}
        </div>
        {projects.length > 4 && <Link href="/projects" className="mt-2 inline-block text-xs font-semibold text-indigo-600">View all projects</Link>}
      </article>
    </section>

    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900">Recent expenses</h2><p className="mt-1 text-xs text-slate-500">Your latest claims</p></div><Link href="/expenses" className="text-xs font-semibold text-indigo-600">View all</Link></div>
      {recentExpenses.length ? <div className="divide-y divide-slate-100">
        {recentExpenses.map((expense) => {
          const status = String(expense.status || 'pending').toLowerCase();
          const statusClass = status === 'approved' ? 'bg-emerald-50 text-emerald-700' : status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700';
          const occurredAt = expenseDate(expense);
          return <Link key={expense.id || `${expense.categoryName || 'expense'}-${expenseDate(expense) || 'unknown'}`} href="/expenses" className="flex flex-wrap items-center gap-3 py-3 hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><Receipt size={16} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{expense.categoryName || expense.category_name || expense.category || 'Expense claim'}</span><span className="block truncate text-xs text-slate-500">{expense.projectName || expense.project_name || projects.find((project) => project.id === (expense.projectId || expense.project_id))?.name || 'Project'} · {occurredAt ? new Date(occurredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}</span></span>
            <span className="text-sm font-bold text-slate-900">{money(amountOf(expense))}</span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass}`}>{status.replace('_', ' ')}</span>
            <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${hasReceipt(expense) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{hasReceipt(expense) ? 'Receipt attached' : 'No receipt'}</span>
          </Link>;
        })}
      </div> : <p className="py-8 text-center text-sm text-slate-500">No expenses to show yet.</p>}
    </article>
  </>;
}

function ViewerDashboardContent({ loading, projects, expenses }: { loading: boolean; projects: RecordData[]; expenses: RecordData[] }) {
  if (loading) return <DashboardLoading />;
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3"><h2 className="text-sm font-bold text-slate-900">Permitted projects</h2><p className="mt-1 text-xs text-slate-500">Read-only project details available to your account.</p></div>
    {projects.length ? <div className="grid gap-3 md:grid-cols-2">
      {projects.map((project) => {
        const projectExpenses = expenses.filter((expense) => (expense.projectId || expense.project_id) === project.id);
        return <Link key={project.id} href={`/projects/${project.id}`} className="rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30">
          <div className="flex items-center gap-3"><UserAvatar src={project.imageUrl || project.image_url} name={project.name || 'Project'} size="md" shape="rounded" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{project.name || 'Project'}</p><p className="truncate text-xs text-slate-500">{project.client || 'Permitted project'}</p></div><span className="text-xs text-slate-500">Read only</span></div>
          <p className="mt-3 text-xs text-slate-500">{projectExpenses.length} expense records visible</p>
        </Link>;
      })}
    </div> : <p className="py-8 text-center text-sm text-slate-500">No permitted projects are available.</p>}
  </article>;
}

function DashboardLoading() {
  return <div className="grid animate-pulse gap-4 lg:grid-cols-2" aria-label="Loading personal dashboard">
    <div className="h-48 rounded-2xl bg-slate-200" /><div className="h-48 rounded-2xl bg-slate-200" />
    <div className="h-56 rounded-2xl bg-slate-100 lg:col-span-2" />
  </div>;
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5"><p className="text-[10px] font-medium text-indigo-100">{label}</p><p className="mt-1 truncate text-sm font-bold text-white">{value}</p></div>;
}

function ComplianceMetric({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'amber' | 'green' }) {
  const colors = { slate: 'text-slate-900', amber: 'text-amber-700', green: 'text-emerald-700' };
  return <div className="rounded-xl bg-slate-50 px-3 py-3"><p className="text-[10px] font-medium text-slate-500">{label}</p><p className={`mt-1 truncate text-sm font-bold ${colors[tone]}`}>{value}</p></div>;
}
