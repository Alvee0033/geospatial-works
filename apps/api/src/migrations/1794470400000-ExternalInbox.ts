import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExternalInbox1794470400000 implements MigrationInterface {
  name = 'ExternalInbox1794470400000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "inbox_conversations_channel_enum" AS ENUM ('WHATSAPP', 'MESSENGER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "inbox_conversations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "channel" "inbox_conversations_channel_enum" NOT NULL,
      "businessAssetId" varchar(160) NOT NULL,
      "participantId" varchar(200) NOT NULL,
      "participantName" varchar(200),
      "lastMessagePreview" varchar(500),
      "lastMessageAt" timestamptz,
      "lastInboundAt" timestamptz,
      "unreadCount" integer NOT NULL DEFAULT 0,
      "active" boolean NOT NULL DEFAULT true,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_inbox_conversation_external" UNIQUE ("channel", "businessAssetId", "participantId")
    )`);
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "inbox_messages_channel_enum" AS ENUM ('WHATSAPP', 'MESSENGER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "inbox_messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "conversationId" uuid NOT NULL REFERENCES "inbox_conversations"("id") ON DELETE CASCADE,
      "channel" "inbox_messages_channel_enum" NOT NULL,
      "providerMessageId" varchar(200) NOT NULL UNIQUE,
      "text" text NOT NULL,
      "fromBusiness" boolean NOT NULL DEFAULT false,
      "sentAt" timestamptz NOT NULL,
      "receivedAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_inbox_message_conversation_date" ON "inbox_messages" ("conversationId", "sentAt")`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inbox_messages"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inbox_messages_channel_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inbox_conversations"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inbox_conversations_channel_enum"`);
  }
}
