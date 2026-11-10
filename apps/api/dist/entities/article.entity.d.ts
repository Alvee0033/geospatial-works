export declare class Article {
    id: string;
    slug: string;
    title: string;
    category: string;
    publishDate: string;
    summary: string;
    content: string;
    author: string;
    imageUrl: string;
    meta: Record<string, string>;
    isPublished: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
