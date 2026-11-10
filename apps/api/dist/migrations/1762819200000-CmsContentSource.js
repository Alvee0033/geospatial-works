"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsContentSource1762819200000 = void 0;
const imported_content_1 = require("../modules/seed/imported-content");
class CmsContentSource1762819200000 {
    constructor() {
        this.name = 'CmsContentSource1762819200000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "meta" jsonb NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "details" jsonb NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "details" jsonb NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true`);
        for (const item of imported_content_1.importedContent.articles) {
            await queryRunner.query(`INSERT INTO "articles" ("id", "slug", "title", "category", "publishDate", "summary", "content", "author", "imageUrl", "meta", "isPublished", "sortOrder", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, now(), now()) ON CONFLICT ("slug") DO NOTHING`, [item.slug, item.title, item.category, item.publishDate, item.summary, item.content, item.author,
                item.imageUrl, JSON.stringify(item.meta), item.isPublished, item.sortOrder]);
        }
        for (const item of imported_content_1.importedContent.services) {
            await queryRunner.query(`INSERT INTO "services" ("id", "slug", "title", "category", "description", "features", "imageUrl", "details", "sortOrder", "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9, now(), now()) ON CONFLICT ("slug") DO NOTHING`, [item.slug, item.title, item.category, item.description, JSON.stringify(item.features), item.imageUrl,
                JSON.stringify(item.details), item.sortOrder, item.isActive]);
        }
        for (const item of imported_content_1.importedContent.projects) {
            await queryRunner.query(`INSERT INTO "projects" ("id", "slug", "title", "client", "category", "location", "description", "deliverables", "imageUrl", "details", "isMilestone", "sortOrder", "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, now(), now()) ON CONFLICT ("slug") DO NOTHING`, [item.slug, item.title, item.client, item.category, item.location, item.description, item.deliverables,
                item.imageUrl, JSON.stringify(item.details), item.isMilestone, item.sortOrder, item.isActive]);
        }
        for (const item of imported_content_1.importedContent.teams) {
            await queryRunner.query(`INSERT INTO "team_members" ("id", "slug", "name", "role", "category", "credentials", "bio", "image", "sortOrder", "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now()) ON CONFLICT ("slug") DO NOTHING`, [item.slug, item.name, item.role, item.category, item.credentials, item.bio, item.image,
                item.sortOrder, item.isActive]);
        }
        await queryRunner.query(`UPDATE "articles" SET "title" = replace("title", '0.20cm', '2 cm')
       WHERE "slug" = 'abdulpur-railway-bypass' AND "title" LIKE '%0.20cm%'`);
        await queryRunner.query(`UPDATE "articles" SET "imageUrl" = NULL
       WHERE "slug" = 'coastal-mangrove-assessment'
       AND "imageUrl" IN ('/projects-extracted/page_25/img_02.jpg', '/real-media/insight-coastal-mangrove-uav.jpg')`);
    }
    async down() {
    }
}
exports.CmsContentSource1762819200000 = CmsContentSource1762819200000;
//# sourceMappingURL=1762819200000-CmsContentSource.js.map