export declare class CreateHeroSlideDto {
    eyebrow?: string;
    heading: string;
    description: string;
    imageUrl: string;
    mediaType?: 'image' | 'video';
    videoUrl?: string;
    primaryActionText?: string;
    primaryActionHref?: string;
    secondaryActionText?: string;
    secondaryActionHref?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class UpdateHeroSlideDto extends CreateHeroSlideDto {
}
