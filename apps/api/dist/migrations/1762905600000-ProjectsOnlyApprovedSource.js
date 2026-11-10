"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsOnlyApprovedSource1762905600000 = void 0;
const imported_content_1 = require("../modules/seed/imported-content");
class ProjectsOnlyApprovedSource1762905600000 {
    constructor() {
        this.name = 'ProjectsOnlyApprovedSource1762905600000';
    }
    async up(queryRunner) {
        const slugs = imported_content_1.importedContent.projects.map((project) => project.slug);
        const placeholders = slugs.map((_, index) => `$${index + 1}`).join(', ');
        await queryRunner.query(`DELETE FROM "projects" WHERE "slug" NOT IN (${placeholders})`, slugs);
    }
    async down() {
    }
}
exports.ProjectsOnlyApprovedSource1762905600000 = ProjectsOnlyApprovedSource1762905600000;
//# sourceMappingURL=1762905600000-ProjectsOnlyApprovedSource.js.map