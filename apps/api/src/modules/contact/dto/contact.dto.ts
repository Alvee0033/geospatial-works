import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({ example: 'Engr. Rafiqul Islam' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'rafiqul@project.gov.bd' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+8801711223344', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Topographic & UAV Survey', required: false })
  @IsString()
  @IsOptional()
  serviceType?: string;

  @ApiProperty({ example: 'Need RTK surveying and contour mapping for 120-hectare economic zone.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

