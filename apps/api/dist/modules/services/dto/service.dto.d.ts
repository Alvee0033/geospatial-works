export declare class CreateServiceDto {
    slug: string;
    title: string;
    category: string;
    description: string;
    features?: string[];
    imageUrl?: string;
    details?: Record<string, unknown>;
    sortOrder?: number;
    isActive?: boolean;
}
declare const UpdateServiceDto_base: import("@nestjs/common").Type<Partial<CreateServiceDto>>;
export declare class UpdateServiceDto extends UpdateServiceDto_base {
}
export {};
