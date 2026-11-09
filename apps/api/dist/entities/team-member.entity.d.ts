export interface StructuredCv {
    summary?: string;
    degrees?: {
        degree: string;
        institution: string;
        year?: string;
    }[];
    licensures?: string[];
    memberships?: string[];
    skills?: string[];
    software?: string[];
    projects?: {
        title: string;
        client?: string;
        role?: string;
        details?: string;
    }[];
    awards?: string[];
}
export declare class TeamMember {
    id: string;
    slug: string;
    name: string;
    role: string;
    category: string;
    credentials: string;
    bio: string;
    image: string;
    email: string;
    phone: string;
    fullCvText: string;
    structuredCv: StructuredCv;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
