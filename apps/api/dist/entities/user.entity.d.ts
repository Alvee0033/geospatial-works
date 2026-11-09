export declare enum UserRole {
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
