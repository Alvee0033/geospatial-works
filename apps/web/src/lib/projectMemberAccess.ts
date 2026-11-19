export type ProjectMemberPermissions = {
  canViewBudget: boolean;
  canRecordRevenue: boolean;
  canViewExpenses: boolean;
  canCreateExpenses: boolean;
  canApproveExpenses: boolean;
  canManageTasks: boolean;
  canUpdateProgress: boolean;
  canManageTeam: boolean;
  canEditProject: boolean;
  canViewAttendance: boolean;
};

export type ProjectMemberPermissionKey = keyof ProjectMemberPermissions;

export const PROJECT_MEMBER_PERMISSION_OPTIONS: {
  key: ProjectMemberPermissionKey;
  label: string;
  description: string;
  tone: 'blue' | 'emerald' | 'violet' | 'amber';
}[] = [
  { key: 'canViewBudget', label: 'View budget', description: 'View project budget and financial health.', tone: 'blue' },
  { key: 'canRecordRevenue', label: 'Record revenue', description: 'Add project revenue and milestones.', tone: 'emerald' },
  { key: 'canViewExpenses', label: 'View expenses', description: 'View project expense claims.', tone: 'blue' },
  { key: 'canCreateExpenses', label: 'Create expenses', description: 'Submit project expense claims.', tone: 'emerald' },
  { key: 'canApproveExpenses', label: 'Approve expenses', description: 'Review, approve, or reject project claims.', tone: 'amber' },
  { key: 'canManageTasks', label: 'Manage tasks', description: 'Create and manage project tasks.', tone: 'violet' },
  { key: 'canUpdateProgress', label: 'Update progress', description: 'Update completion and site progress.', tone: 'violet' },
  { key: 'canManageTeam', label: 'Manage team', description: 'Assign members and adjust project access.', tone: 'amber' },
  { key: 'canEditProject', label: 'Edit project', description: 'Change project settings and site details.', tone: 'amber' },
  { key: 'canViewAttendance', label: 'View attendance', description: 'View project attendance records.', tone: 'blue' },
];

const DEFAULT_PERMISSIONS: ProjectMemberPermissions = {
  canViewBudget: false,
  canRecordRevenue: false,
  canViewExpenses: true,
  canCreateExpenses: true,
  canApproveExpenses: false,
  canManageTasks: true,
  canUpdateProgress: true,
  canManageTeam: false,
  canEditProject: false,
  canViewAttendance: true,
};

export function resolveProjectMemberPermissions(value: unknown): ProjectMemberPermissions {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const resolved = { ...DEFAULT_PERMISSIONS };

  for (const option of PROJECT_MEMBER_PERMISSION_OPTIONS) {
    const snakeCase = option.key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    const candidate = source[option.key] ?? source[snakeCase];
    if (typeof candidate === 'boolean') resolved[option.key] = candidate;
  }

  return resolved;
}

export function countGrantedProjectPermissions(permissions: ProjectMemberPermissions): number {
  return PROJECT_MEMBER_PERMISSION_OPTIONS.reduce(
    (count, option) => count + Number(permissions[option.key]),
    0,
  );
}

export function makeProjectMemberAccessPayload(
  userId: string,
  roleInProject: string,
  permissions: ProjectMemberPermissions,
) {
  return {
    userId,
    roleInProject: roleInProject.trim(),
    permissions: resolveProjectMemberPermissions(permissions),
  };
}
