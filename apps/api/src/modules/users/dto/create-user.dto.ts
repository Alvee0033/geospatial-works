import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'engineer@geospatialworks.com.bd' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Delwar Hossain' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must have at least 2 characters' })
  name: string;

  @ApiProperty({ example: 'SecureP@ss2026!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.EDITOR })
  @IsEnum(UserRole, { message: 'Role must be ADMIN, EDITOR, or VIEWER' })
  @IsNotEmpty()
  role: UserRole;
}
