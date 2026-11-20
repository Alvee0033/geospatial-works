import { MigrationInterface, QueryRunner } from 'typeorm';

export class GmailInbox1794556800000 implements MigrationInterface {
  name = 'GmailInbox1794556800000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "inbox_conversations_channel_enum" RENAME TO "inbox_conversations_channel_enum_old"`);
    await queryRunner.query(`CREATE TYPE "inbox_conversations_channel_enum" AS ENUM ('WHATSAPP', 'MESSENGER', 'GMAIL')`);
    await queryRunner.query(`ALTER TABLE "inbox_conversations" ALTER COLUMN "channel" TYPE "inbox_conversations_channel_enum" USING "channel"::text::"inbox_conversations_channel_enum"`);
    await queryRunner.query(`DROP TYPE "inbox_conversations_channel_enum_old"`);
    await queryRunner.query(`ALTER TYPE "inbox_messages_channel_enum" RENAME TO "inbox_messages_channel_enum_old"`);
    await queryRunner.query(`CREATE TYPE "inbox_messages_channel_enum" AS ENUM ('WHATSAPP', 'MESSENGER', 'GMAIL')`);
    await queryRunner.query(`ALTER TABLE "inbox_messages" ALTER COLUMN "channel" TYPE "inbox_messages_channel_enum" USING "channel"::text::"inbox_messages_channel_enum"`);
    await queryRunner.query(`DROP TYPE "inbox_messages_channel_enum_old"`);
    await queryRunner.query(`ALTER TABLE "inbox_conversations" ADD COLUMN "replyAddress" varchar(320), ADD COLUMN "emailThreadId" varchar(200), ADD COLUMN "emailSubject" varchar(500), ADD COLUMN "lastEmailMessageId" varchar(500)`);
    await queryRunner.query(`CREATE TABLE "gmail_inbox_connection" (
      "id" varchar(16) PRIMARY KEY,
      "email" varchar(320) NOT NULL,
      "encryptedRefreshToken" text NOT NULL,
      "iv" varchar(32) NOT NULL,
      "authTag" varchar(32) NOT NULL,
      "historyId" varchar(200),
      "connectedAt" timestamptz NOT NULL,
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "gmail_inbox_connection"`);
    await queryRunner.query(`ALTER TABLE "inbox_conversations" DROP COLUMN IF EXISTS "replyAddress", DROP COLUMN IF EXISTS "emailThreadId", DROP COLUMN IF EXISTS "emailSubject", DROP COLUMN IF EXISTS "lastEmailMessageId"`);
    await queryRunner.query(`ALTER TYPE "inbox_conversations_channel_enum" RENAME TO "inbox_conversations_channel_enum_new"`);
    await queryRunner.query(`CREATE TYPE "inbox_conversations_channel_enum" AS ENUM ('WHATSAPP', 'MESSENGER')`);
    await queryRunner.query(`ALTER TABLE "inbox_conversations" ALTER COLUMN "channel" TYPE "inbox_conversations_channel_enum" USING "channel"::text::"inbox_conversations_channel_enum"`);
    await queryRunner.query(`DROP TYPE "inbox_conversations_channel_enum_new"`);
    await queryRunner.query(`ALTER TYPE "inbox_messages_channel_enum" RENAME TO "inbox_messages_channel_enum_new"`);
    await queryRunner.query(`CREATE TYPE "inbox_messages_channel_enum" AS ENUM ('WHATSAPP', 'MESSENGER')`);
    await queryRunner.query(`ALTER TABLE "inbox_messages" ALTER COLUMN "channel" TYPE "inbox_messages_channel_enum" USING "channel"::text::"inbox_messages_channel_enum"`);
    await queryRunner.query(`DROP TYPE "inbox_messages_channel_enum_new"`);
  }
}
