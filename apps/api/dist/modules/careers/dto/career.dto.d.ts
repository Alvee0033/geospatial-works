import { JobType, JobStatus } from '../../../entities/job-post.entity';
import { ApplicationStatus } from '../../../entities/job-application.entity';
export declare class CreateJobPostDto {
    title: string;
    slug?: string;
    department: string;
    location: string;
    type?: JobType;
    summary: string;
    description?: string;
    qualifications?: string[];
    responsibilities?: string[];
    experienceLevel?: string;
    salaryRange?: string;
    deadline?: string;
    status?: JobStatus;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class UpdateJobPostDto {
    title?: string;
    slug?: string;
    department?: string;
    location?: string;
    type?: JobType;
    summary?: string;
    description?: string;
    qualifications?: string[];
    responsibilities?: string[];
    experienceLevel?: string;
    salaryRange?: string;
    deadline?: string;
    status?: JobStatus;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class CreateApplicationDto {
    jobPostId?: string;
    fullName: string;
    email: string;
    phone: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    currentCompany?: string;
    currentTitle?: string;
    yearsOfExperience?: string;
    coverLetter?: string;
    resumeUrl?: string;
}
export declare class UpdateApplicationStatusDto {
    status?: ApplicationStatus;
    internalNotes?: string;
}
