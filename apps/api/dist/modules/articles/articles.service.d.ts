import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { Project } from '../../entities/project.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
export declare class ArticlesService {
    private readonly articleRepo;
    private readonly projectRepo;
    constructor(articleRepo: Repository<Article>, projectRepo: Repository<Project>);
    seedProjectCaseStudies(): Promise<{
        created: number;
        hiddenDemoArticles: number;
        projects: number;
    }>;
    findAll(publishedOnly?: boolean): Promise<Article[]>;
    findBySlug(slug: string, publishedOnly?: boolean): Promise<Article>;
    create(dto: CreateArticleDto): Promise<Article>;
    update(id: string, dto: UpdateArticleDto): Promise<Article>;
    remove(id: string): Promise<void>;
}
