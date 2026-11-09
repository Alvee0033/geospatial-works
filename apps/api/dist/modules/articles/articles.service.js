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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("../../entities/article.entity");
let ArticlesService = class ArticlesService {
    constructor(articleRepo) {
        this.articleRepo = articleRepo;
    }
    async findAll(publishedOnly = true) {
        const qb = this.articleRepo.createQueryBuilder('article');
        if (publishedOnly) {
            qb.where('article.isPublished = :pub', { pub: true });
        }
        return qb.orderBy('article.sortOrder', 'ASC').addOrderBy('article.createdAt', 'DESC').getMany();
    }
    async findBySlug(slug) {
        const article = await this.articleRepo.findOne({ where: { slug } });
        if (!article)
            throw new common_1.NotFoundException(`Article with slug "${slug}" not found`);
        return article;
    }
    async create(dto) {
        const slug = dto.slug ||
            dto.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        const article = this.articleRepo.create({
            ...dto,
            slug,
            publishDate: dto.publishDate || new Date().toISOString().split('T')[0],
        });
        return this.articleRepo.save(article);
    }
    async update(id, dto) {
        const article = await this.articleRepo.findOne({ where: { id } });
        if (!article)
            throw new common_1.NotFoundException(`Article with ID "${id}" not found`);
        Object.assign(article, dto);
        return this.articleRepo.save(article);
    }
    async remove(id) {
        const res = await this.articleRepo.delete(id);
        if (!res.affected)
            throw new common_1.NotFoundException(`Article with ID "${id}" not found`);
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map