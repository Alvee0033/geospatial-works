import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countGrantedProjectPermissions,
  makeProjectMemberAccessPayload,
  resolveProjectMemberPermissions,
} from '../src/lib/projectMemberAccess.ts';

test('permission resolution preserves explicit false values and supports API snake case', () => {
  const permissions = resolveProjectMemberPermissions({
    can_view_budget: true,
    canApproveExpenses: false,
    can_manage_team: true,
  });

  assert.equal(permissions.canViewBudget, true);
  assert.equal(permissions.canApproveExpenses, false);
  assert.equal(permissions.canManageTeam, true);
  assert.equal(permissions.canCreateExpenses, true);
});

test('save payload includes all ten permission flags and a trimmed project role', () => {
  const payload = makeProjectMemberAccessPayload('member-1', '  Site Lead  ', {
    ...resolveProjectMemberPermissions({}),
    canApproveExpenses: true,
  });

  assert.equal(payload.userId, 'member-1');
  assert.equal(payload.roleInProject, 'Site Lead');
  assert.equal(Object.keys(payload.permissions).length, 10);
  assert.equal(payload.permissions.canApproveExpenses, true);
});

test('permission summary counts enabled capabilities only', () => {
  assert.equal(countGrantedProjectPermissions(resolveProjectMemberPermissions({ canViewBudget: true })), 6);
});
