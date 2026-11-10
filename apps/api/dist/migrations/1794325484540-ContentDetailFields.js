"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDetailFields1794325484540 = void 0;
class ContentDetailFields1794325484540 {
    constructor() {
        this.name = 'ContentDetailFields1794325484540';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "meta" jsonb NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "details" jsonb NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "details" jsonb NOT NULL DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true`);
    }
    async down() {
    }
}
exports.ContentDetailFields1794325484540 = ContentDetailFields1794325484540;
//# sourceMappingURL=1794325484540-ContentDetailFields.js.map