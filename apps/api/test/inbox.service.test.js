const assert = require('node:assert/strict');
const { test } = require('node:test');
require('reflect-metadata');
const { InboxService } = require('../dist/modules/inbox/inbox.service');

test('inbox list returns saved conversations without waiting for provider history', async () => {
  const conversations = [{ id: 'saved-thread' }];
  const service = new InboxService(
    { find: async () => conversations }, {}, {}, {}, {}, {},
  );
  service.syncMessengerHistory = () => new Promise(() => {});

  const result = await Promise.race([
    service.listConversations(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Inbox waited for remote history')), 100)),
  ]);

  assert.deepEqual(result, conversations);
});
