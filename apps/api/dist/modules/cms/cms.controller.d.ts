import { CmsService } from './cms.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero-slide.dto';
import { UpdatePageSectionDto } from './dto/page-section.dto';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
    getLandingPageData(): Promise<{
        heroSlides: import("../../entities/hero-slide.entity").HeroSlide[];
        sections: Record<string, import("../../entities/page-section.entity").PageSection>;
    }>;
    getActiveHeroSlides(): Promise<import("../../entities/hero-slide.entity").HeroSlide[]>;
    getSectionsByPage(pageKey: string): Promise<import("../../entities/page-section.entity").PageSection[]>;
    getAllHeroSlides(): Promise<import("../../entities/hero-slide.entity").HeroSlide[]>;
    createHeroSlide(dto: CreateHeroSlideDto): Promise<import("../../entities/hero-slide.entity").HeroSlide>;
    updateHeroSlide(id: string, dto: UpdateHeroSlideDto): Promise<import("../../entities/hero-slide.entity").HeroSlide>;
    deleteHeroSlide(id: string): Promise<void>;
    getAllSections(): Promise<import("../../entities/page-section.entity").PageSection[]>;
    updateSection(pageKey: string, sectionKey: string, dto: UpdatePageSectionDto): Promise<import("../../entities/page-section.entity").PageSection>;
}
