import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Omit<import("../../entities/user.entity").User, "passwordHash">[]>;
    create(dto: CreateUserDto): Promise<Omit<import("../../entities/user.entity").User, "passwordHash">>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<Omit<import("../../entities/user.entity").User, "passwordHash">>;
    update(id: string, dto: UpdateUserDto, req: any): Promise<Omit<import("../../entities/user.entity").User, "passwordHash">>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
