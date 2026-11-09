import { UserRole } from '../../../entities/user.entity';
export declare class UpdateUserDto {
    email?: string;
    name?: string;
    password?: string;
    role?: UserRole;
}
