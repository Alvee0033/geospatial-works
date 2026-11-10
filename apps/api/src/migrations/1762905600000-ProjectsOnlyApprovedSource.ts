import { MigrationInterface, QueryRunner } from 'typeorm';
import { importedContent } from '../modules/seed/imported-content';

/** Keep projects limited to the 17 records extracted from the approved public project source. */
export class ProjectsOnlyApprovedSource1762905600000 implements MigrationInterface {
  name = 'ProjectsOnlyApprovedSource1762905600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const slugs = importedContent.projects.map((project) => project.slug);
    const placeholders = slugs.map((_, index) => `$${index + 1}`).join(', ');
    await queryRunner.query(`DELETE FROM "projects" WHERE "slug" NOT IN (${placeholders})`, slugs);
  }

  async down(): Promise<void> {
    // The removed legacy project rows cannot be recreated; back up the database before running this cleanup.
  }
}
