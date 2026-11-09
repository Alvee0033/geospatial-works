import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Exclude passwordHash from returned objects for security
  private sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'ASC' },
    });
    return users.map((u) => this.sanitizeUser(u));
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const emailNormalized = dto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOne({ where: { email: emailNormalized } });
    if (existing) {
      throw new ConflictException(`User with email "${emailNormalized}" already exists`);
    }

    // High security hashing with 12 bcrypt salt rounds
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = this.userRepository.create({
      email: emailNormalized,
      name: dto.name.trim(),
      passwordHash,
      role: dto.role || UserRole.EDITOR,
    });

    const saved = await this.userRepository.save(newUser);
    return this.sanitizeUser(saved);
  }

  async update(id: string, dto: UpdateUserDto, currentAdminId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If changing email, check uniqueness
    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const emailNormalized = dto.email.toLowerCase().trim();
      const existing = await this.userRepository.findOne({ where: { email: emailNormalized } });
      if (existing) {
        throw new ConflictException(`Email "${emailNormalized}" is already registered`);
      }
      user.email = emailNormalized;
    }

    if (dto.name) {
      user.name = dto.name.trim();
    }

    // Role change protection: ensure at least one active ADMIN remains
    if (dto.role && dto.role !== user.role) {
      if (user.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
        const adminCount = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
        if (adminCount <= 1) {
          throw new BadRequestException('Cannot demote the last remaining System Administrator');
        }
      }
      user.role = dto.role;
    }

    // Password reset if provided by admin
    if (dto.password && dto.password.trim().length >= 8) {
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    const updated = await this.userRepository.save(user);
    return this.sanitizeUser(updated);
  }

  async remove(id: string, currentAdminId: string): Promise<{ success: boolean; message: string }> {
    if (id === currentAdminId) {
      throw new BadRequestException('Security violation: You cannot delete your own logged-in admin account');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Ensure we never delete the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException('Security violation: Cannot delete the sole remaining Administrator account');
      }
    }

    await this.userRepository.remove(user);
    return { success: true, message: `User ${user.email} removed successfully` };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match system records');
    }

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('New password must have at least 8 characters');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await this.userRepository.save(user);

    return { success: true, message: 'Password updated successfully and encrypted with 12-round BCrypt' };
  }
}
