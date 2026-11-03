import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRouteForRole, getNavigationForRole, isAssignedToUser, selectAssignedProjects, selectOwnProjectRecords, selectOwnRecords } from '../src/lib/roleAccess.ts';

test('project members receive only personal workspace navigation', () => {
  const groups = getNavigationForRole('project_member');
  const links = groups.flatMap((group) => group.items);

  assert.deepEqual(links.map(({ href }) => href), [
    '/dashboard', '/projects', '/tasks', '/expenses', '/attendance', '/leaves', '/chat',
  ]);
  assert.equal(links.some(({ label }) => /reports|cash flow|transactions|approvals|voucher|people|clients|settings/i.test(label)), false);
});

test('project members can open personal work areas but not administrative routes or project editing', () => {
  for (const path of ['/dashboard', '/projects', '/projects/123', '/tasks', '/expenses', '/attendance', '/leaves', '/chat']) {
    assert.equal(canAccessRouteForRole('project_member', path), true, path);
  }
  for (const path of ['/reports', '/payroll', '/approvals', '/expenses/compliance', '/employees', '/clients', '/settings', '/projects/new', '/projects/123/edit']) {
    assert.equal(canAccessRouteForRole('project_member', path), false, path);
  }
});

test('other roles keep the existing navigation and access behavior', () => {
  assert.equal(getNavigationForRole('main_admin'), null);
  assert.equal(canAccessRouteForRole('project_manager', '/projects/new'), true);
  assert.equal(canAccessRouteForRole('viewer', '/reports'), true);
});

test('personal project and attendance selectors exclude coworkers records', () => {
  const assignedProjects = selectAssignedProjects([
    { id: 'mine', teamMemberIds: ['employee-1'] },
    { id: 'other', team_member_ids: ['employee-2'] },
  ], 'employee-1');
  assert.deepEqual(assignedProjects.map(({ id }) => id), ['mine']);

  const ownCheckins = selectOwnRecords([
    { id: 'checkin-1', userId: 'employee-1' },
    { id: 'checkin-2', user_id: 'employee-2' },
  ], 'employee-1');
  assert.deepEqual(ownCheckins.map(({ id }) => id), ['checkin-1']);
  assert.equal(isAssignedToUser({ assignees: [{ id: 'employee-1' }] }, 'employee-1'), true);
});

test('project detail claims include only the member claims for that project', () => {
  const claims = selectOwnProjectRecords([
    { id: 'mine-id', employeeId: 'employee-1', projectId: 'project-1' },
    { id: 'mine-name', employeeId: 'employee-1', projectName: 'Project One' },
    { id: 'other-project', employeeId: 'employee-1', projectId: 'project-2' },
    { id: 'coworker', employeeId: 'employee-2', projectId: 'project-1' },
  ], 'employee-1', { id: 'project-1', name: 'Project One' });

  assert.deepEqual(claims.map(({ id }) => id), ['mine-id', 'mine-name']);
});
