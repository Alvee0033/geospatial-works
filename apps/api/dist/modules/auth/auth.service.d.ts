import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<User | null>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
        };
    }>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
    }>;
}
