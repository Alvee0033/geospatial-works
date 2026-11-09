"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const project_dto_1 = require("./dto/project.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async findAll(milestonesOnly) {
        return this.projectsService.findAll(milestonesOnly === 'true');
    }
    async findBySlug(slug) {
        return this.projectsService.findBySlug(slug);
    }
    async create(dto) {
        return this.projectsService.create(dto);
    }
    async update(id, dto) {
        return this.projectsService.update(id, dto);
    }
    async delete(id) {
        return this.projectsService.delete(id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get projects (optionally filter milestones)' }),
    (0, swagger_1.ApiQuery)({ name: 'milestonesOnly', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('milestonesOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single project by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create a new project' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update an existing project' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a project' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "delete", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map