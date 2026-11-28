export interface ReportFilters {
  from?: string;
  to?: string;
  projectId?: string;
  client?: string;
  department?: string;
  status?: string;
  category?: string;
  expenseType?: string;
  receiptStatus?: string;
  priority?: string;
  shift?: string;
  userId?: string;
  search?: string;
}

type ReportRow = Record<string, unknown>;

const firstValue = (row: ReportRow, keys: string[]): string => {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim()) return String(value);
  }
  return '';
};

export function filterReportRows<T extends ReportRow>(rows: T[], filters: ReportFilters): T[] {
  const query = filters.search?.trim().toLocaleLowerCase() ?? '';

  return rows.filter((row) => {
    const date = firstValue(row, ['date', 'createdAt', 'created_at', 'startDate', 'start_date', 'dueDate', 'due_date']).slice(0, 10);
    if (filters.from && (!date || date < filters.from)) return false;
    if (filters.to && (!date || date > filters.to)) return false;

    if (filters.projectId && filters.projectId !== 'all') {
      const projectId = firstValue(row, ['projectId', 'project_id']);
      if (projectId !== filters.projectId) return false;
    }

    if (filters.client && filters.client !== 'all') {
      const client = firstValue(row, ['client', 'clientName', 'client_name']).toLocaleLowerCase();
      if (client !== filters.client.toLocaleLowerCase()) return false;
    }

    if (filters.department && filters.department !== 'all') {
      const dept = firstValue(row, ['department', 'dept']).toLocaleLowerCase();
      if (dept !== filters.department.toLocaleLowerCase()) return false;
    }

    if (filters.expenseType && filters.expenseType !== 'all') {
      const expType = firstValue(row, ['expenseType', 'expense_type']).toLocaleLowerCase();
      if (expType !== filters.expenseType.toLocaleLowerCase()) return false;
    }

    if (filters.receiptStatus && filters.receiptStatus !== 'all') {
      const receiptInfo = firstValue(row, ['receiptInfo']).toLocaleLowerCase();
      const hasReceipt = receiptInfo.includes('attached');
      if (filters.receiptStatus === 'attached' && !hasReceipt) return false;
      if (filters.receiptStatus === 'missing' && hasReceipt) return false;
    }

    if (filters.priority && filters.priority !== 'all') {
      const priority = firstValue(row, ['priority']).toLocaleLowerCase();
      if (priority !== filters.priority.toLocaleLowerCase()) return false;
    }

    if (filters.shift && filters.shift !== 'all') {
      const shift = firstValue(row, ['sessionType', 'session_type', 'shift']).toLocaleLowerCase();
      if (!shift.includes(filters.shift.toLocaleLowerCase())) return false;
    }

    if (filters.status && filters.status !== 'all') {
      const status = firstValue(row, ['status', 'approvalStatus', 'approval_status', 'leaveStatus', 'leave_status']).toLocaleLowerCase();
      if (status !== filters.status.toLocaleLowerCase()) return false;
    }

    if (filters.category && filters.category !== 'all') {
      const category = firstValue(row, ['category', 'categoryName', 'category_name', 'leaveType', 'leave_type']).toLocaleLowerCase();
      if (category !== filters.category.toLocaleLowerCase()) return false;
    }

    if (filters.userId && filters.userId !== 'all') {
      const userId = firstValue(row, ['userId', 'user_id', 'employeeId', 'employee_id', 'assigneeId', 'assignee_id']);
      const assignees = Array.isArray(row.assignees) ? row.assignees : [];
      const assigneeIds = Array.isArray(row.assigneeIds) ? row.assigneeIds.map(String) : [];
      const isAssigned = assignees.some((assignee) => {
        if (!assignee || typeof assignee !== 'object') return false;
        const member = assignee as Record<string, unknown>;
        return String(member.id ?? member.userId ?? member.user_id ?? '') === filters.userId;
      });
      if (userId !== filters.userId && !assigneeIds.includes(filters.userId) && !isAssigned) return false;
    }

    if (query) {
      const searchable = Object.values(row).map((value) => String(value ?? '')).join(' ').toLocaleLowerCase();
      if (!searchable.includes(query)) return false;
    }
    return true;
  });
}
