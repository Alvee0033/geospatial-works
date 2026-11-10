export declare class Project {
    id: string;
    slug: string;
    title: string;
    client: string;
    category: string;
    location: string;
    description: string;
    deliverables: string;
    imageUrl: string;
    details: Record<string, unknown>;
    isActive: boolean;
    isMilestone: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
