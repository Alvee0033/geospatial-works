export declare class CreateArticleDto {
    title: string;
    slug?: string;
    category: string;
    publishDate?: string;
    summary: string;
    content?: string;
    author?: string;
    imageUrl?: string;
    meta?: Record<string, string>;
    isPublished?: boolean;
    sortOrder?: number;
}
declare const UpdateArticleDto_base: import("@nestjs/common").Type<Partial<CreateArticleDto>>;
export declare class UpdateArticleDto extends UpdateArticleDto_base {
}
export {};
