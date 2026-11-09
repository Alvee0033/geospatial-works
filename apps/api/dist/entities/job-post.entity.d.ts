import { JobApplication } from './job-application.entity';
export declare enum JobType {
    FULL_TIME = "Full-time",
    PART_TIME = "Part-time",
    CONTRACT = "Contract",
    PERMANENT = "Full-time / Permanent",
    INTERNSHIP = "Internship"
}
export declare enum JobStatus {
    PUBLISHED = "published",
    DRAFT = "draft",
    CLOSED = "closed"
}
export declare class JobPost {
    id: string;
    slug: string;
    title: string;
    department: string;
    location: string;
    type: JobType;
    summary: string;
    description: string;
    qualifications: string[];
    responsibilities: string[];
    experienceLevel: string;
    salaryRange: string;
    deadline: string;
    status: JobStatus;
    isActive: boolean;
    sortOrder: number;
    applications: JobApplication[];
    createdAt: Date;
    updatedAt: Date;
}
