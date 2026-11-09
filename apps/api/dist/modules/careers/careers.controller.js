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
exports.CareersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const careers_service_1 = require("./careers.service");
const career_dto_1 = require("./dto/career.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CareersController = class CareersController {
    constructor(careersService) {
        this.careersService = careersService;
    }
    async getJobs(all) {
        return this.careersService.findAllJobs(all === 'true');
    }
    async getJobBySlug(slug) {
        return this.careersService.findJobBySlug(slug);
    }
    async submitApplication(dto) {
        return this.careersService.submitApplication(dto);
    }
    async getAdminJobs() {
        return this.careersService.findAllJobs(true);
    }
    async createJob(dto) {
        return this.careersService.createJob(dto);
    }
    async updateJob(id, dto) {
        return this.careersService.updateJob(id, dto);
    }
    async deleteJob(id) {
        return this.careersService.deleteJob(id);
    }
    async getApplications(jobPostId, search) {
        return this.careersService.findAllApplications(jobPostId, search);
    }
    async updateApplicationStatus(id, dto) {
        return this.careersService.updateApplicationStatus(id, dto);
    }
    async deleteApplication(id) {
        return this.careersService.deleteApplication(id);
    }
};
exports.CareersController = CareersController;
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active published jobs' }),
    (0, swagger_1.ApiQuery)({ name: 'all', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('all')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Get)('jobs/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single job posting details' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getJobBySlug", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a job application' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [career_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "submitApplication", null);
__decorate([
    (0, common_1.Get)('admin/jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: List all jobs including draft and closed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getAdminJobs", null);
__decorate([
    (0, common_1.Post)('admin/jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create a new job opening' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [career_dto_1.CreateJobPostDto]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "createJob", null);
__decorate([
    (0, common_1.Put)('admin/jobs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update an existing job opening' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, career_dto_1.UpdateJobPostDto]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Delete)('admin/jobs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a job opening' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "deleteJob", null);
__decorate([
    (0, common_1.Get)('admin/applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: List applications with optional job filter & candidate search' }),
    (0, swagger_1.ApiQuery)({ name: 'jobPostId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)('jobPostId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Put)('admin/applications/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update application status or internal notes' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, career_dto_1.UpdateApplicationStatusDto]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Delete)('admin/applications/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete an application' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CareersController.prototype, "deleteApplication", null);
exports.CareersController = CareersController = __decorate([
    (0, swagger_1.ApiTags)('Careers & Applications'),
    (0, common_1.Controller)('careers'),
    __metadata("design:paramtypes", [careers_service_1.CareersService])
], CareersController);
//# sourceMappingURL=careers.controller.js.map