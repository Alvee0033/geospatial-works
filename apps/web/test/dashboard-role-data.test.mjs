import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardAudience, getDashboardDataKeys, selectPersonalDashboardData, summarizeMemberExpenses } from '../src/lib/dashboardRoleData.ts';

test('dashboard audience keeps project members personal and viewers read-only', () => {
  assert.equal(getDashboardAudience('project_member'), 'member');
  assert.equal(getDashboardAudience('viewer'), 'viewer');
  assert.deepEqual(getDashboardDataKeys('project_member'), ['projects', 'expenses']);
  assert.deepEqual(getDashboardDataKeys('viewer'), ['projects', 'expenses']);
  for (const role of ['main_admin', 'project_manager', 'finance', 'finance_manager']) {
    assert.equal(getDashboardAudience(role), 'company');
    assert.equal(getDashboardDataKeys(role).includes('people'), true);
  }
});

test('member data mirrors assigned projects and visible own or assigned-project expenses', () => {
  const projects = [
    { id: 'p1', teamMemberIds: ['u1'] },
    { id: 'p2', team_members: ['u1', 'u2'] },
    { id: 'p3', teamMemberIds: ['u2'] },
  ];
  const expenses = [
    { id: 'e1', employeeId: 'u1', projectId: 'p3', amount: 100 },
    { id: 'e2', employee_id: 'u2', project_id: 'p1', amount: 200 },
    { id: 'e3', employeeId: 'u2', projectId: 'p3', amount: 300 },
  ];

  const selected = selectPersonalDashboardData('u1', projects, expenses);
  assert.deepEqual(selected.projects.map((project) => project.id), ['p1', 'p2']);
  assert.deepEqual(selected.expenses.map((expense) => expense.id), ['e1', 'e2']);
});

test('member summary matches Flutter claim and receipt calculations', () => {
  const summary = summarizeMemberExpenses([
    { amount: 100, status: 'approved', hasReceipt: true, date: '2026-11-02' },
    { amount: 50, status: 'approved', has_receipt: false, date: '2026-11-01' },
    { amount: 75, status: 'pending', hasReceipt: false, date: '2026-11-03' },
    { amount: 20, status: 'approved', receipt_photo_url: '/receipt.jpg', date: '2026-10-25' },
  ], new Date('2026-11-03T12:00:00'));

  assert.equal(summary.approvedTotal, 170);
  assert.equal(summary.claimedTotal, 245);
  assert.equal(summary.unreceiptedAmount, 125);
  assert.equal(summary.unreceiptedRatio, 51);
  assert.equal(summary.currentMonthSpend, 150);
  assert.equal(summary.highReceiptRisk, true);
});

test('member summary handles an empty account without invented figures', () => {
  assert.deepEqual(summarizeMemberExpenses([], new Date('2026-11-03T12:00:00')), {
    approvedTotal: 0,
    claimedTotal: 0,
    unreceiptedAmount: 0,
    unreceiptedRatio: 0,
    receiptedRatio: 100,
    currentMonthSpend: 0,
    highReceiptRisk: false,
  });
  assert.deepEqual(selectPersonalDashboardData('u1', [], []), { projects: [], expenses: [], personalExpenses: [] });
});
