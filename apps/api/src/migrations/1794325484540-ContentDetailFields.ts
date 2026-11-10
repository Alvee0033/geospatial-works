import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds the structured fields used by current public and admin content views. */
export class ContentDetailFields1794325484540 implements MigrationInterface {
  name = 'ContentDetailFields1794325484540';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "meta" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "details" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "details" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  async down(): Promise<void> {
    // Preserve editor-managed values if this additive schema migration is reverted.
  }
}
