import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'topographic-survey' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Topographic & Land Survey' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'SURVEY & GEODATA' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Site, cadastral and boundary surveys with GNSS control.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['RTK GNSS Positioning', 'DSM/DEM Terrain Modeling', 'Contours & Cadastral Mapping'] })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({ example: '/inner/field-surveyor.webp', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateServiceDto extends CreateServiceDto {}

