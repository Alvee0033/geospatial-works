import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAssignableProjects } from '../src/lib/projectAssignment.ts';

test('project assignment search matches names case-insensitively and ignores surrounding whitespace', () => {
  const projects = [
    { id: 'p1', name: 'Updated Test Project' },
    { id: 'p2', name: 'Example' },
  ];

  assert.deepEqual(
    filterAssignableProjects(projects, '  UPDATED test '),
    [projects[0]],
  );
});

test('empty project assignment search returns all projects', () => {
  const projects = [
    { id: 'p1', name: 'Updated Test Project' },
    { id: 'p2', name: 'Example' },
  ];

  assert.deepEqual(filterAssignableProjects(projects, '  '), projects);
});
