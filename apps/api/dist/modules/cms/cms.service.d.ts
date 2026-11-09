import { Repository } from 'typeorm';
import { HeroSlide } from '../../entities/hero-slide.entity';
import { PageSection } from '../../entities/page-section.entity';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero-slide.dto';
import { UpdatePageSectionDto } from './dto/page-section.dto';
export declare class CmsService {
    private readonly heroSlideRepository;
    private readonly pageSectionRepository;
    constructor(heroSlideRepository: Repository<HeroSlide>, pageSectionRepository: Repository<PageSection>);
    getActiveHeroSlides(): Promise<HeroSlide[]>;
    getAllHeroSlides(): Promise<HeroSlide[]>;
    createHeroSlide(dto: CreateHeroSlideDto): Promise<HeroSlide>;
    updateHeroSlide(id: string, dto: UpdateHeroSlideDto): Promise<HeroSlide>;
    deleteHeroSlide(id: string): Promise<void>;
    getSectionsByPage(pageKey: string): Promise<PageSection[]>;
    getAllSections(): Promise<PageSection[]>;
    updateSection(pageKey: string, sectionKey: string, dto: UpdatePageSectionDto): Promise<PageSection>;
    getLandingPageData(): Promise<{
        heroSlides: HeroSlide[];
        sections: Record<string, PageSection>;
    }>;
}
