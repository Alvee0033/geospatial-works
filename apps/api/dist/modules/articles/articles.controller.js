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
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const articles_service_1 = require("./articles.service");
const article_dto_1 = require("./dto/article.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ArticlesController = class ArticlesController {
    constructor(articlesService) {
        this.articlesService = articlesService;
    }
    async findAll(publishedOnly) {
        return this.articlesService.findAll(publishedOnly !== 'false');
    }
    async findBySlug(slug) {
        return this.articlesService.findBySlug(slug);
    }
    async create(dto) {
        return this.articlesService.create(dto);
    }
    async update(id, dto) {
        return this.articlesService.update(id, dto);
    }
    async remove(id) {
        return this.articlesService.remove(id);
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all published news and technical bulletins' }),
    (0, swagger_1.ApiQuery)({ name: 'publishedOnly', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('publishedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single news article by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create news or bulletin' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [article_dto_1.CreateArticleDto]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update news article' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, article_dto_1.UpdateArticleDto]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete news article' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "remove", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, swagger_1.ApiTags)('News & Articles'),
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map