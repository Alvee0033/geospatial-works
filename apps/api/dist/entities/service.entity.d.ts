export declare class Service {
    id: string;
    slug: string;
    title: string;
    category: string;
    description: string;
    features: string[];
    imageUrl: string;
    details: Record<string, unknown>;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
