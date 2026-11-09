import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHeroSlideDto {
  @ApiProperty({ example: 'PEOPLE • DATA • RESILIENT BANGLADESH' })
  @IsString()
  @IsOptional()
  eyebrow?: string;

  @ApiProperty({ example: 'Know the Ground. Shape the Future.' })
  @IsString()
  @IsNotEmpty()
  heading: string;

  @ApiProperty({ example: 'Precision geospatial surveying and spatial intelligence across Bangladesh.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '/delta-hero-v2.webp' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ example: 'image', enum: ['image', 'video'], required: false })
  @IsString()
  @IsOptional()
  mediaType?: 'image' | 'video';

  @ApiProperty({ example: '/hero-video.mp4', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: 'Explore Our Services' })
  @IsString()
  @IsOptional()
  primaryActionText?: string;

  @ApiProperty({ example: '/services' })
  @IsString()
  @IsOptional()
  primaryActionHref?: string;

  @ApiProperty({ example: 'Get in Touch' })
  @IsString()
  @IsOptional()
  secondaryActionText?: string;

  @ApiProperty({ example: '/contact' })
  @IsString()
  @IsOptional()
  secondaryActionHref?: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateHeroSlideDto extends CreateHeroSlideDto {}

