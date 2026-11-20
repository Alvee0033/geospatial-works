import { MigrationInterface, QueryRunner } from 'typeorm';

/** Stores optional, admin-managed links used to contact project clients. */
export class ClientMessagingContacts1794384000000 implements MigrationInterface {
  name = 'ClientMessagingContacts1794384000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "client_contacts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "normalizedName" character varying NOT NULL UNIQUE,
        "clientName" character varying(160) NOT NULL,
        "whatsappPhone" character varying(15),
        "messengerUrl" character varying(500),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(): Promise<void> {
    // Keep contact information if this migration is rolled back.
  }
}
