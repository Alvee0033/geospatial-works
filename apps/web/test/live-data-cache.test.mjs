import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSettledData } from '../src/lib/liveDataCache.mjs';

test('keeps cached real rows for failed sources and replaces only successful sources', () => {
  const previous = { tasks: [{ id: 'existing-task' }], leaves: [{ id: 'existing-leave' }] };
  const result = mergeSettledData(previous, {
    tasks: { status: 'rejected', reason: new Error('offline') },
    leaves: { status: 'fulfilled', value: [{ id: 'new-leave' }] },
  });

  assert.deepEqual(result.data, {
    tasks: [{ id: 'existing-task' }],
    leaves: [{ id: 'new-leave' }],
  });
  assert.deepEqual(result.failed, ['tasks']);
});
