import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from '../../entities/hero-slide.entity';
import { PageSection } from '../../entities/page-section.entity';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero-slide.dto';
import { UpdatePageSectionDto } from './dto/page-section.dto';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly heroSlideRepository: Repository<HeroSlide>,
    @InjectRepository(PageSection)
    private readonly pageSectionRepository: Repository<PageSection>,
  ) {}

  // Hero Slides
  async getActiveHeroSlides(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getAllHeroSlides(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createHeroSlide(dto: CreateHeroSlideDto): Promise<HeroSlide> {
    const slide = this.heroSlideRepository.create(dto);
    return this.heroSlideRepository.save(slide);
  }

  async updateHeroSlide(id: string, dto: UpdateHeroSlideDto): Promise<HeroSlide> {
    const slide = await this.heroSlideRepository.findOne({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Hero slide with ID ${id} not found`);
    }
    Object.assign(slide, dto);
    return this.heroSlideRepository.save(slide);
  }

  async deleteHeroSlide(id: string): Promise<void> {
    const result = await this.heroSlideRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Hero slide with ID ${id} not found`);
    }
  }

  // Page Sections
  async getSectionsByPage(pageKey: string): Promise<PageSection[]> {
    return this.pageSectionRepository.find({
      where: { pageKey, isActive: true },
    });
  }

  async getAllSections(): Promise<PageSection[]> {
    return this.pageSectionRepository.find();
  }

  async updateSection(pageKey: string, sectionKey: string, dto: UpdatePageSectionDto): Promise<PageSection> {
    let section = await this.pageSectionRepository.findOne({
      where: { pageKey, sectionKey },
    });
    if (!section) {
      section = this.pageSectionRepository.create({ pageKey, sectionKey, ...dto });
    } else {
      Object.assign(section, dto);
    }
    return this.pageSectionRepository.save(section);
  }

  // Bundled Landing Page Data
  async getLandingPageData() {
    const [heroSlides, sections] = await Promise.all([
      this.getActiveHeroSlides(),
      this.getSectionsByPage('home'),
    ]);

    const sectionMap = sections.reduce((acc, s) => {
      acc[s.sectionKey] = s;
      return acc;
    }, {} as Record<string, PageSection>);

    return {
      heroSlides,
      sections: sectionMap,
    };
  }
}

