import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { Project } from '../../entities/project.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async seedProjectCaseStudies(): Promise<{ created: number; hiddenDemoArticles: number; projects: number }> {
    const projects = await this.projectRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    let created = 0;

    for (const project of projects) {
      const slug = `project-${project.slug}`;
      const existing = await this.articleRepo.findOne({ where: { slug } });
      if (existing) continue; // Preserve edits and publication choices made in Admin.

      const details = project.details || {};
      const sections = [
        '## Project overview',
        project.description,
        project.client || project.location ? `## Client and location\n${[project.client, project.location].filter(Boolean).join(' · ')}` : '',
        project.deliverables ? `## Project outputs\n${project.deliverables}` : '',
        Array.isArray(details.approach) && details.approach.length
          ? `## Work completed\n${details.approach.map((item) => `• ${String(item)}`).join('\n')}`
          : '',
      ].filter(Boolean);

      await this.articleRepo.save(this.articleRepo.create({
        slug,
        title: project.title,
        category: 'Project case study',
        summary: project.description,
        content: sections.join('\n\n'),
        author: 'Geospatial Works',
        imageUrl: project.imageUrl || undefined,
        meta: { contentType: 'project-case-study', projectId: project.id, projectSlug: project.slug },
        isPublished: true,
        sortOrder: project.sortOrder,
      }));
      created += 1;
    }

    // The starter seed contains these unverified sample articles. Keep them in
    // Admin as drafts instead of deleting article records or editor history.
    const demoSlugs = [
      'river-delta-resilience-bathymetry',
      'rtk-gnss-national-corridor-geodesy',
      'dhaka-wasa-smart-utility-digital-twin',
      'high-density-uav-lidar-flood-defenses',
      'ground-penetrating-radar-urban-expressway',
      'coastal-erosion-drone-orthomosaics',
      'dtca-bus-route-rationalization',
      'abdulpur-railway-bypass',
      'coastal-mangrove-assessment',
    ];
    const hiddenDemoArticles = await this.articleRepo
      .createQueryBuilder()
      .update(Article)
      .set({ isPublished: false })
      .where('slug IN (:...demoSlugs)', { demoSlugs })
      .andWhere('isPublished = :published', { published: true })
      .execute();

    return { created, hiddenDemoArticles: hiddenDemoArticles.affected || 0, projects: projects.length };
  }

  async findAll(publishedOnly = true): Promise<Article[]> {
    const qb = this.articleRepo.createQueryBuilder('article');
    if (publishedOnly) {
      qb.where('article.isPublished = :pub', { pub: true });
    }
    return qb.orderBy('article.sortOrder', 'ASC').addOrderBy('article.createdAt', 'DESC').getMany();
  }

  async findBySlug(slug: string, publishedOnly = false): Promise<Article> {
    const article = await this.articleRepo.findOne({ where: publishedOnly ? { slug, isPublished: true } : { slug } });
    if (!article) throw new NotFoundException(`Article with slug "${slug}" not found`);
    return article;
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const slug =
      dto.slug ||
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

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException(`Article with ID "${id}" not found`);

    Object.assign(article, dto);
    return this.articleRepo.save(article);
  }

  async remove(id: string): Promise<void> {
    const res = await this.articleRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Article with ID "${id}" not found`);
  }
}

