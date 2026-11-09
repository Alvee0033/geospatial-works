import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    private sanitizeUser;
    findAll(): Promise<Omit<User, 'passwordHash'>[]>;
    findOne(id: string): Promise<Omit<User, 'passwordHash'>>;
    create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    update(id: string, dto: UpdateUserDto, currentAdminId: string): Promise<Omit<User, 'passwordHash'>>;
    remove(id: string, currentAdminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
