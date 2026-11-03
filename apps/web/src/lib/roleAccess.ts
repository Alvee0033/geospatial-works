export type RoleNavigationGroup = {
  label: string;
  items: { href: string; label: string; icon: string }[];
};

const memberNavigation: RoleNavigationGroup[] = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Overview', icon: 'overview' },
      { href: '/projects', label: 'My projects', icon: 'projects' },
      { href: '/tasks', label: 'My tasks', icon: 'tasks' },
    ],
  },
  {
    label: 'My work',
    items: [
      { href: '/expenses', label: 'My claims', icon: 'claims' },
      { href: '/attendance', label: 'My attendance', icon: 'attendance' },
      { href: '/leaves', label: 'My leave', icon: 'leave' },
      { href: '/chat', label: 'Messages', icon: 'messages' },
    ],
  },
];

export function getNavigationForRole(role?: string | null): RoleNavigationGroup[] | null {
  return role === 'project_member' ? memberNavigation : null;
}

export function canAccessRouteForRole(role: string | null | undefined, pathname: string): boolean {
  if (role !== 'project_member') return true;
  const allowed = ['/dashboard', '/projects', '/tasks', '/expenses', '/attendance', '/leaves', '/chat'];
  if (!allowed.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return false;
  if (pathname === '/projects/new' || /^\/projects\/[^/]+\/edit(?:\/|$)/.test(pathname)) return false;
  if (pathname === '/expenses/compliance' || pathname.startsWith('/expenses/compliance/')) return false;
  return true;
}

function asId(value: unknown): string {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return String(record.id ?? record._id ?? '');
  }
  return String(value ?? '');
}

export function isAssignedToUser(record: Record<string, unknown>, userId: string): boolean {
  const assigneeIds = record.assigneeIds ?? record.assignee_ids ?? record.assignees;
  const directAssignee = record.assigneeId ?? record.assignee_id ?? record.employeeId ?? record.employee_id ?? record.userId ?? record.user_id;
  const normalizedId = String(userId);

  if (Array.isArray(assigneeIds) && assigneeIds.some((value) => asId(value) === normalizedId)) return true;
  if (directAssignee != null && asId(directAssignee) === normalizedId) return true;
  return false;
}

export function selectAssignedProjects<T extends Record<string, unknown>>(projects: T[], userId: string): T[] {
  return projects.filter((project) => {
    const members = project.teamMemberIds ?? project.team_member_ids ?? project.team_members;
    return Array.isArray(members) && members.some((member) => asId(member) === String(userId));
  });
}

export function selectOwnRecords<T extends Record<string, unknown>>(records: T[], userId: string): T[] {
  return records.filter((record) => isAssignedToUser(record, userId));
}
