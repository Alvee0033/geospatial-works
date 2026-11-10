import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    findAll(): Promise<import("../../entities/article.entity").Article[]>;
    findAllAdmin(): Promise<import("../../entities/article.entity").Article[]>;
    seedProjectCaseStudies(): Promise<{
        created: number;
        hiddenDemoArticles: number;
        projects: number;
    }>;
    findBySlug(slug: string): Promise<import("../../entities/article.entity").Article>;
    create(dto: CreateArticleDto): Promise<import("../../entities/article.entity").Article>;
    update(id: string, dto: UpdateArticleDto): Promise<import("../../entities/article.entity").Article>;
    remove(id: string): Promise<void>;
}
