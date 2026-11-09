import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    findAll(publishedOnly?: string): Promise<import("../../entities/article.entity").Article[]>;
    findBySlug(slug: string): Promise<import("../../entities/article.entity").Article>;
    create(dto: CreateArticleDto): Promise<import("../../entities/article.entity").Article>;
    update(id: string, dto: UpdateArticleDto): Promise<import("../../entities/article.entity").Article>;
    remove(id: string): Promise<void>;
}
