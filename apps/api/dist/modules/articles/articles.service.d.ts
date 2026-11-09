import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
export declare class ArticlesService {
    private readonly articleRepo;
    constructor(articleRepo: Repository<Article>);
    findAll(publishedOnly?: boolean): Promise<Article[]>;
    findBySlug(slug: string): Promise<Article>;
    create(dto: CreateArticleDto): Promise<Article>;
    update(id: string, dto: UpdateArticleDto): Promise<Article>;
    remove(id: string): Promise<void>;
}
