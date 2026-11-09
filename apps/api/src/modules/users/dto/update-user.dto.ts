import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'engineer@geospatialworks.com.bd' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Delwar Hossain' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'NewSecureP@ss2026!' })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long if provided' })
  password?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole, { message: 'Role must be ADMIN, EDITOR, or VIEWER' })
  @IsOptional()
  role?: UserRole;
}
