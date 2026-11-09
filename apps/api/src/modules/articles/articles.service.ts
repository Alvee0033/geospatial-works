import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  async findAll(publishedOnly = true): Promise<Article[]> {
    const qb = this.articleRepo.createQueryBuilder('article');
    if (publishedOnly) {
      qb.where('article.isPublished = :pub', { pub: true });
    }
    return qb.orderBy('article.sortOrder', 'ASC').addOrderBy('article.createdAt', 'DESC').getMany();
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepo.findOne({ where: { slug } });
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

