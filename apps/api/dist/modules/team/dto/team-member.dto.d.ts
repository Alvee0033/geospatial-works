export declare class CreateTeamMemberDto {
    name: string;
    role: string;
    category: string;
    slug?: string;
    credentials?: string;
    bio?: string;
    image?: string;
    email?: string;
    phone?: string;
    fullCvText?: string;
    structuredCv?: any;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class UpdateTeamMemberDto extends CreateTeamMemberDto {
}
