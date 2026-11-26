import { MigrationInterface, QueryRunner } from 'typeorm';

export class MetaInboxConnections1794643200000 implements MigrationInterface {
  name = 'MetaInboxConnections1794643200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "meta_inbox_connection" (
      "channel" varchar(16) PRIMARY KEY,
      "assetId" varchar(128) NOT NULL,
      "parentAssetId" varchar(128),
      "displayName" varchar(255) NOT NULL,
      "encryptedAccessToken" text NOT NULL,
      "iv" varchar(32) NOT NULL,
      "authTag" varchar(32) NOT NULL,
      "tokenExpiresAt" timestamptz,
      "connectedAt" timestamptz NOT NULL,
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "meta_inbox_connection_channel_check" CHECK ("channel" IN ('WHATSAPP', 'MESSENGER'))
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "meta_inbox_connection"`);
  }
}
