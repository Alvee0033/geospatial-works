import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, JobStatus } from '../../../entities/job-post.entity';
import { ApplicationStatus } from '../../../entities/job-application.entity';

export class CreateJobPostDto {
  @ApiProperty({ example: 'Lead Geodetic Surveyor (RTK & Total Station)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'lead-geodetic-surveyor' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Geodesy & Ground Survey' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Dhaka & Field Locations, Bangladesh' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ enum: JobType, default: JobType.FULL_TIME })
  @IsEnum(JobType)
  @IsOptional()
  type?: JobType;

  @ApiProperty({ example: 'Lead primary geodetic control networks...' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiPropertyOptional({ example: 'Full detailed job overview and scope of works' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['5+ years hands-on experience'] })
  @IsArray()
  @IsOptional()
  qualifications?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Establish geodetic bench marks'] })
  @IsArray()
  @IsOptional()
  responsibilities?: string[];

  @ApiPropertyOptional({ example: '5+ years' })
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional({ example: 'Negotiable / Commensurate with experience' })
  @IsString()
  @IsOptional()
  salaryRange?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.PUBLISHED })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateJobPostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsEnum(JobType)
  @IsOptional()
  type?: JobType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  qualifications?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  responsibilities?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  salaryRange?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateApplicationDto {
  @ApiPropertyOptional({ example: 'job-post-uuid-here' })
  @IsString()
  @IsOptional()
  jobPostId?: string;

  @ApiProperty({ example: 'Alvee Hasan' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'alvee@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+880 1712 345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/alvee' })
  @IsString()
  @IsOptional()
  linkedInUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/alvee' })
  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @ApiPropertyOptional({ example: 'Survey Solutions Ltd' })
  @IsString()
  @IsOptional()
  currentCompany?: string;

  @ApiPropertyOptional({ example: 'Senior GIS Engineer' })
  @IsString()
  @IsOptional()
  currentTitle?: string;

  @ApiPropertyOptional({ example: '4 years' })
  @IsString()
  @IsOptional()
  yearsOfExperience?: string;

  @ApiPropertyOptional({ example: 'Passionate about geomatics and RTK network adjustments...' })
  @IsString()
  @IsOptional()
  coverLetter?: string;

  @ApiPropertyOptional({ example: '/uploads/resumes/my_resume.pdf' })
  @IsString()
  @IsOptional()
  resumeUrl?: string;
}

export class UpdateApplicationStatusDto {
  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  internalNotes?: string;
}
