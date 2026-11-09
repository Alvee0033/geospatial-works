import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  publishDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

