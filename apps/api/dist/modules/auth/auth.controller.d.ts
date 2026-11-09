import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../../entities/user.entity").UserRole;
        };
    }>;
    me(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../../entities/user.entity").UserRole;
    }>;
}
