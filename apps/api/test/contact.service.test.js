const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
require('reflect-metadata');
const { ContactService } = require('../dist/modules/contact/contact.service');

const previousKey = process.env.RESEND_API_KEY;
afterEach(() => {
  global.fetch = originalFetch;
  if (previousKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = previousKey;
});
const originalFetch = global.fetch;

test('CV request uses the settings receiver and requester reply address', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  const sent = [];
  global.fetch = async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return { ok: true, status: 200 };
  };
  const inquiry = {
    id: 'request-id', fullName: 'Jane <Example>', email: 'jane@example.org',
    serviceType: 'CV request: Engineer A & B', message: 'Organization: Example Ltd\nReason: Project bid',
  };
  const service = new ContactService(
    { create: (value) => value, save: async () => inquiry },
    { findOne: async () => ({ content: {
      senderEmail: 'security@geospatialworks.com.bd',
      cvRequestEmail: 'cv@example.org',
      emailCareers: 'careers@example.org',
    } }) },
  );

  await service.createInquiry(inquiry);
  await new Promise(setImmediate);

  assert.equal(sent.length, 2);
  assert.deepEqual(sent[0].to, ['cv@example.org']);
  assert.equal(sent[0].from, 'Geospatial Works <security@geospatialworks.com.bd>');
  assert.equal(sent[0].reply_to, 'jane@example.org');
  assert.equal(sent[0].subject, 'CV request for Engineer A & B — Jane <Example>');
  assert.match(sent[0].html, /Jane &lt;Example&gt;/);
  assert.match(sent[0].html, /Engineer A &amp; B/);
  assert.deepEqual(sent[1].to, ['jane@example.org']);
  assert.equal(sent[1].reply_to, undefined);
});
