"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    sanitizeUser(user) {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async findAll() {
        const users = await this.userRepository.find({
            order: { createdAt: 'ASC' },
        });
        return users.map((u) => this.sanitizeUser(u));
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.sanitizeUser(user);
    }
    async create(dto) {
        const emailNormalized = dto.email.toLowerCase().trim();
        const existing = await this.userRepository.findOne({ where: { email: emailNormalized } });
        if (existing) {
            throw new common_1.ConflictException(`User with email "${emailNormalized}" already exists`);
        }
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(dto.password, salt);
        const newUser = this.userRepository.create({
            email: emailNormalized,
            name: dto.name.trim(),
            passwordHash,
            role: dto.role || user_entity_1.UserRole.EDITOR,
        });
        const saved = await this.userRepository.save(newUser);
        return this.sanitizeUser(saved);
    }
    async update(id, dto, currentAdminId) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
            const emailNormalized = dto.email.toLowerCase().trim();
            const existing = await this.userRepository.findOne({ where: { email: emailNormalized } });
            if (existing) {
                throw new common_1.ConflictException(`Email "${emailNormalized}" is already registered`);
            }
            user.email = emailNormalized;
        }
        if (dto.name) {
            user.name = dto.name.trim();
        }
        if (dto.role && dto.role !== user.role) {
            if (user.role === user_entity_1.UserRole.ADMIN && dto.role !== user_entity_1.UserRole.ADMIN) {
                const adminCount = await this.userRepository.count({ where: { role: user_entity_1.UserRole.ADMIN } });
                if (adminCount <= 1) {
                    throw new common_1.BadRequestException('Cannot demote the last remaining System Administrator');
                }
            }
            user.role = dto.role;
        }
        if (dto.password && dto.password.trim().length >= 8) {
            const salt = await bcrypt.genSalt(12);
            user.passwordHash = await bcrypt.hash(dto.password, salt);
        }
        const updated = await this.userRepository.save(user);
        return this.sanitizeUser(updated);
    }
    async remove(id, currentAdminId) {
        if (id === currentAdminId) {
            throw new common_1.BadRequestException('Security violation: You cannot delete your own logged-in admin account');
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const adminCount = await this.userRepository.count({ where: { role: user_entity_1.UserRole.ADMIN } });
            if (adminCount <= 1) {
                throw new common_1.BadRequestException('Security violation: Cannot delete the sole remaining Administrator account');
            }
        }
        await this.userRepository.remove(user);
        return { success: true, message: `User ${user.email} removed successfully` };
    }
    async changePassword(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User profile not found');
        }
        const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Current password does not match system records');
        }
        if (dto.newPassword.length < 8) {
            throw new common_1.BadRequestException('New password must have at least 8 characters');
        }
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
        await this.userRepository.save(user);
        return { success: true, message: 'Password updated successfully and encrypted with 12-round BCrypt' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map