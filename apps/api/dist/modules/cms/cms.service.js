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
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const hero_slide_entity_1 = require("../../entities/hero-slide.entity");
const page_section_entity_1 = require("../../entities/page-section.entity");
let CmsService = class CmsService {
    constructor(heroSlideRepository, pageSectionRepository) {
        this.heroSlideRepository = heroSlideRepository;
        this.pageSectionRepository = pageSectionRepository;
    }
    async getActiveHeroSlides() {
        return this.heroSlideRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', createdAt: 'ASC' },
        });
    }
    async getAllHeroSlides() {
        return this.heroSlideRepository.find({
            order: { sortOrder: 'ASC', createdAt: 'ASC' },
        });
    }
    async createHeroSlide(dto) {
        const slide = this.heroSlideRepository.create(dto);
        return this.heroSlideRepository.save(slide);
    }
    async updateHeroSlide(id, dto) {
        const slide = await this.heroSlideRepository.findOne({ where: { id } });
        if (!slide) {
            throw new common_1.NotFoundException(`Hero slide with ID ${id} not found`);
        }
        Object.assign(slide, dto);
        return this.heroSlideRepository.save(slide);
    }
    async deleteHeroSlide(id) {
        const result = await this.heroSlideRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Hero slide with ID ${id} not found`);
        }
    }
    async getSectionsByPage(pageKey) {
        return this.pageSectionRepository.find({
            where: { pageKey, isActive: true },
        });
    }
    async getAllSections() {
        return this.pageSectionRepository.find();
    }
    async updateSection(pageKey, sectionKey, dto) {
        let section = await this.pageSectionRepository.findOne({
            where: { pageKey, sectionKey },
        });
        if (!section) {
            section = this.pageSectionRepository.create({ pageKey, sectionKey, ...dto });
        }
        else {
            Object.assign(section, dto);
        }
        return this.pageSectionRepository.save(section);
    }
    async getLandingPageData() {
        const [heroSlides, sections] = await Promise.all([
            this.getActiveHeroSlides(),
            this.getSectionsByPage('home'),
        ]);
        const sectionMap = sections.reduce((acc, s) => {
            acc[s.sectionKey] = s;
            return acc;
        }, {});
        return {
            heroSlides,
            sections: sectionMap,
        };
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(hero_slide_entity_1.HeroSlide)),
    __param(1, (0, typeorm_1.InjectRepository)(page_section_entity_1.PageSection)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CmsService);
//# sourceMappingURL=cms.service.js.map