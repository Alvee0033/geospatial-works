type DashboardRecord = Record<string, unknown>;

export const money = (amount: number) => `৳${Math.round(amount).toLocaleString()}`;

export type DashboardAudience = 'member' | 'viewer' | 'company';

export function getDashboardAudience(role?: string | null): DashboardAudience {
  if (role === 'project_member') return 'member';
  if (role === 'viewer') return 'viewer';
  return 'company';
}

export function getDashboardDataKeys(role?: string | null): string[] {
  if (getDashboardAudience(role) !== 'company') return ['projects', 'expenses'];
  return ['projects', 'expenses', 'attendance', 'people', 'tasks', 'attendanceHistory', 'leaveRequests'];
}

function recordId(record: DashboardRecord, camel: string, snake: string): string {
  return String(record[camel] ?? record[snake] ?? '');
}

export function selectPersonalDashboardData(
  userId: string,
  projects: DashboardRecord[],
  expenses: DashboardRecord[],
) {
  const assignedProjects = projects.filter((project) => {
    const teamMemberIds = project.teamMemberIds ?? project.team_member_ids ?? project.team_members;
    return Array.isArray(teamMemberIds) && teamMemberIds.map(String).includes(userId);
  });
  const assignedProjectIds = new Set(assignedProjects.map((project) => String(project.id)));
  const personalExpenses = expenses.filter((expense) => recordId(expense, 'employeeId', 'employee_id') === userId);
  const visibleExpenses = expenses.filter((expense) =>
    recordId(expense, 'employeeId', 'employee_id') === userId
      || assignedProjectIds.has(recordId(expense, 'projectId', 'project_id')),
  );

  return { projects: assignedProjects, expenses: visibleExpenses, personalExpenses };
}

function hasReceipt(expense: DashboardRecord): boolean {
  return Boolean(
    expense.hasReceipt ?? expense.has_receipt
      ?? expense.receiptPhotoUrl ?? expense.receipt_photo_url
      ?? expense.receiptUrl ?? expense.receipt_url,
  );
}

function expenseDate(expense: DashboardRecord): Date | null {
  const value = expense.date ?? expense.createdAt ?? expense.created_at;
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function summarizeMemberExpenses(expenses: DashboardRecord[], now = new Date()) {
  const amountOf = (expense: DashboardRecord) => Number(expense.amount) || 0;
  const approved = expenses.filter((expense) => String(expense.status || '').toLowerCase() === 'approved');
  const claimedTotal = expenses.reduce((sum, expense) => sum + amountOf(expense), 0);
  const unreceiptedAmount = expenses.filter((expense) => !hasReceipt(expense))
    .reduce((sum, expense) => sum + amountOf(expense), 0);
  const currentMonthSpend = approved.reduce((sum, expense) => {
    const date = expenseDate(expense);
    return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
      ? sum + amountOf(expense)
      : sum;
  }, 0);
  const unreceiptedRatio = claimedTotal > 0 ? Math.round((unreceiptedAmount / claimedTotal) * 100) : 0;

  return {
    approvedTotal: approved.reduce((sum, expense) => sum + amountOf(expense), 0),
    claimedTotal,
    unreceiptedAmount,
    unreceiptedRatio,
    receiptedRatio: Math.max(0, 100 - unreceiptedRatio),
    currentMonthSpend,
    highReceiptRisk: unreceiptedRatio >= 50,
  };
}
