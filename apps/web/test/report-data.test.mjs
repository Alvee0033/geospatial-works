import test from 'node:test';
import assert from 'node:assert/strict';
import { filterReportRows } from '../src/lib/reportData.ts';

test('report filters apply date, project, status and search together', () => {
  const rows = [
    { date: '2026-10-03', projectId: 'p1', status: 'approved', title: 'Travel claim' },
    { date: '2026-10-05', projectId: 'p2', status: 'approved', title: 'Office supplies' },
    { date: '2026-10-08', projectId: 'p1', status: 'pending', title: 'Travel advance' },
  ];

  assert.deepEqual(filterReportRows(rows, {
    from: '2026-10-01',
    to: '2026-10-06',
    projectId: 'p1',
    status: 'approved',
    search: 'travel',
  }), [rows[0]]);
});

test('report filters treat missing optional fields as empty values', () => {
  const rows = [{ title: 'Task with no project', status: 'open' }];
  assert.deepEqual(filterReportRows(rows, { projectId: 'p1' }), []);
});

test('employee filter includes every assignee on a task', () => {
  const rows = [{
    title: 'Review site report',
    assigneeId: 'user-1',
    assignees: [{ id: 'user-1', name: 'Ava' }, { id: 'user-2', name: 'Ben' }],
  }];

  assert.deepEqual(filterReportRows(rows, { userId: 'user-2' }), rows);
});
