import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageSectionDto {
  @ApiProperty({ example: 'Turning spatial data into real-world impact.' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '/ ABOUT', required: false })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: { kicker: 'LOCAL EXPERTISE' }, required: false })
  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

