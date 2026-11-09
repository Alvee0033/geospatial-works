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
exports.CmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cms_service_1 = require("./cms.service");
const hero_slide_dto_1 = require("./dto/hero-slide.dto");
const page_section_dto_1 = require("./dto/page-section.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CmsController = class CmsController {
    constructor(cmsService) {
        this.cmsService = cmsService;
    }
    async getLandingPageData() {
        return this.cmsService.getLandingPageData();
    }
    async getActiveHeroSlides() {
        return this.cmsService.getActiveHeroSlides();
    }
    async getSectionsByPage(pageKey) {
        return this.cmsService.getSectionsByPage(pageKey);
    }
    async getAllHeroSlides() {
        return this.cmsService.getAllHeroSlides();
    }
    async createHeroSlide(dto) {
        return this.cmsService.createHeroSlide(dto);
    }
    async updateHeroSlide(id, dto) {
        return this.cmsService.updateHeroSlide(id, dto);
    }
    async deleteHeroSlide(id) {
        return this.cmsService.deleteHeroSlide(id);
    }
    async getAllSections() {
        return this.cmsService.getAllSections();
    }
    async updateSection(pageKey, sectionKey, dto) {
        return this.cmsService.updateSection(pageKey, sectionKey, dto);
    }
};
exports.CmsController = CmsController;
__decorate([
    (0, common_1.Get)('landing-page'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete dynamic landing page content package' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getLandingPageData", null);
__decorate([
    (0, common_1.Get)('hero-slides'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active hero carousel slides' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getActiveHeroSlides", null);
__decorate([
    (0, common_1.Get)('sections/:pageKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active sections for a specific page' }),
    __param(0, (0, common_1.Param)('pageKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getSectionsByPage", null);
__decorate([
    (0, common_1.Get)('admin/hero-slides'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all hero slides (active and inactive)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getAllHeroSlides", null);
__decorate([
    (0, common_1.Post)('admin/hero-slides'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create a new hero carousel slide' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hero_slide_dto_1.CreateHeroSlideDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "createHeroSlide", null);
__decorate([
    (0, common_1.Put)('admin/hero-slides/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update an existing hero slide' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, hero_slide_dto_1.UpdateHeroSlideDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "updateHeroSlide", null);
__decorate([
    (0, common_1.Delete)('admin/hero-slides/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a hero slide' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "deleteHeroSlide", null);
__decorate([
    (0, common_1.Get)('admin/sections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all page sections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getAllSections", null);
__decorate([
    (0, common_1.Put)('admin/sections/:pageKey/:sectionKey'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update or create a page section' }),
    __param(0, (0, common_1.Param)('pageKey')),
    __param(1, (0, common_1.Param)('sectionKey')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, page_section_dto_1.UpdatePageSectionDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "updateSection", null);
exports.CmsController = CmsController = __decorate([
    (0, swagger_1.ApiTags)('CMS & Page Content'),
    (0, common_1.Controller)('cms'),
    __metadata("design:paramtypes", [cms_service_1.CmsService])
], CmsController);
//# sourceMappingURL=cms.controller.js.map