export declare class CreateProjectDto {
    slug: string;
    title: string;
    client: string;
    category: string;
    location?: string;
    description: string;
    deliverables?: string;
    imageUrl?: string;
    details?: Record<string, unknown>;
    isActive?: boolean;
    isMilestone?: boolean;
    sortOrder?: number;
}
declare const UpdateProjectDto_base: import("@nestjs/common").Type<Partial<CreateProjectDto>>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
}
export {};
