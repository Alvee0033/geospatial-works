import 'reflect-metadata';
import { DataSource, QueryRunner } from 'typeorm';
import { ExternalInbox1794470400000 } from '../migrations/1794470400000-ExternalInbox';
import { GmailInbox1794556800000 } from '../migrations/1794556800000-GmailInbox';
import { MetaInboxConnections1794643200000 } from '../migrations/1794643200000-MetaInboxConnections';

const migrations = [
  new ExternalInbox1794470400000(),
  new GmailInbox1794556800000(),
  new MetaInboxConnections1794643200000(),
];

async function hasGmailSchema(queryRunner: QueryRunner) {
  const conversations = await queryRunner.getTable('inbox_conversations');
  const messages = await queryRunner.getTable('inbox_messages');
  if (!conversations || !messages || !(await queryRunner.hasTable('gmail_inbox_connection'))) return false;
  const requiredColumns = ['replyAddress', 'emailThreadId', 'emailSubject', 'lastEmailMessageId'];
  return requiredColumns.every((name) => conversations.columns.some((column) => column.name === name));
}

async function hasExternalSchema(queryRunner: QueryRunner) {
  const conversations = await queryRunner.getTable('inbox_conversations');
  const messages = await queryRunner.getTable('inbox_messages');
  if (!conversations || !messages) return false;
  const conversationColumns = ['channel', 'businessAssetId', 'participantId', 'lastInboundAt', 'unreadCount', 'active'];
  const messageColumns = ['conversationId', 'channel', 'providerMessageId', 'text', 'fromBusiness', 'sentAt'];
  return conversationColumns.every((name) => conversations.columns.some((column) => column.name === name))
    && messageColumns.every((name) => messages.columns.some((column) => column.name === name));
}

async function run() {
  const database = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5433),
    username: process.env.DATABASE_USER || 'alvee',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'geospatial_works_db',
    synchronize: false,
    logging: false,
  });

  await database.initialize();
  const queryRunner = database.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "gw_inbox_schema_migrations" (
      "name" varchar(200) PRIMARY KEY,
      "appliedAt" timestamptz NOT NULL DEFAULT now()
    )`);
    const applied = new Set<string>((await queryRunner.query('SELECT "name" FROM "gw_inbox_schema_migrations"')).map((row: { name: string }) => row.name));
    for (const migration of migrations) {
      if (applied.has(migration.name)) continue;

      // A fully existing schema is safely adopted into this focused migration
      // ledger. Unrelated historical migrations are deliberately not run here.
      if (migration.name === 'ExternalInbox1794470400000' && await hasExternalSchema(queryRunner)) {
        await queryRunner.query('INSERT INTO "gw_inbox_schema_migrations" ("name") VALUES ($1) ON CONFLICT DO NOTHING', [migration.name]);
        continue;
      }
      if (migration.name === 'GmailInbox1794556800000' && await hasGmailSchema(queryRunner)) {
        await queryRunner.query('INSERT INTO "gw_inbox_schema_migrations" ("name") VALUES ($1) ON CONFLICT DO NOTHING', [migration.name]);
        continue;
      }
      if (migration.name === 'MetaInboxConnections1794643200000' && await queryRunner.hasTable('meta_inbox_connection')) {
        await queryRunner.query('INSERT INTO "gw_inbox_schema_migrations" ("name") VALUES ($1) ON CONFLICT DO NOTHING', [migration.name]);
        continue;
      }

      await queryRunner.startTransaction();
      try {
        await migration.up(queryRunner);
        await queryRunner.query('INSERT INTO "gw_inbox_schema_migrations" ("name") VALUES ($1) ON CONFLICT DO NOTHING', [migration.name]);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      }
    }
    console.log('Inbox database schema is up to date.');
  } finally {
    await queryRunner.release();
    await database.destroy();
  }
}

void run().catch((error) => {
  console.error(`Inbox schema migration failed: ${error instanceof Error ? error.message : 'database error'}`);
  process.exitCode = 1;
});
