import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'web-ais-badc' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'WEB-AIS Irrigation & Water Management System' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'BADC (Bangladesh Agricultural Development Corporation)' })
  @IsString()
  @IsNotEmpty()
  client: string;

  @ApiProperty({ example: 'HYDROGRAPHIC & AGRI-TECH' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Manikganj & Gangarampur', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'Installation of River Water Level Gauge Readers and Topographic Surveying.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Water Level Monitoring, Topographic Contours, NDVI Vegetation Index', required: false })
  @IsString()
  @IsOptional()
  deliverables?: string;

  @ApiProperty({ example: '/inner/banner-projects.webp', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isMilestone?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateProjectDto extends CreateProjectDto {}

