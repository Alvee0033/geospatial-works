import { JobPost } from './job-post.entity';
export declare enum ApplicationStatus {
    NEW = "new",
    REVIEWING = "reviewing",
    SHORTLISTED = "shortlisted",
    INTERVIEWED = "interviewed",
    REJECTED = "rejected",
    HIRED = "hired"
}
export declare class JobApplication {
    id: string;
    jobPostId: string;
    jobPost: JobPost;
    fullName: string;
    email: string;
    phone: string;
    linkedInUrl: string;
    portfolioUrl: string;
    currentCompany: string;
    currentTitle: string;
    yearsOfExperience: string;
    coverLetter: string;
    resumeUrl: string;
    status: ApplicationStatus;
    internalNotes: string;
    createdAt: Date;
    updatedAt: Date;
}
