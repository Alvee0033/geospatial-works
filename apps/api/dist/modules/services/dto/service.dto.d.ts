export declare class CreateServiceDto {
    slug: string;
    title: string;
    category: string;
    description: string;
    features?: string[];
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class UpdateServiceDto extends CreateServiceDto {
}
