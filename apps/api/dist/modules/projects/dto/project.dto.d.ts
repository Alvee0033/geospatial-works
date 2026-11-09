export declare class CreateProjectDto {
    slug: string;
    title: string;
    client: string;
    category: string;
    location?: string;
    description: string;
    deliverables?: string;
    imageUrl?: string;
    isMilestone?: boolean;
    sortOrder?: number;
}
export declare class UpdateProjectDto extends CreateProjectDto {
}
