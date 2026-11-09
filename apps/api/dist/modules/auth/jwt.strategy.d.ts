import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../../entities/user.entity").UserRole;
    }>;
}
export {};
