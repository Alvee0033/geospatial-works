import { CareersService } from './careers.service';
import { CreateJobPostDto, UpdateJobPostDto, CreateApplicationDto, UpdateApplicationStatusDto } from './dto/career.dto';
export declare class CareersController {
    private readonly careersService;
    constructor(careersService: CareersService);
    getJobs(all?: string): Promise<import("../../entities/job-post.entity").JobPost[]>;
    getJobBySlug(slug: string): Promise<import("../../entities/job-post.entity").JobPost>;
    submitApplication(dto: CreateApplicationDto): Promise<import("../../entities/job-application.entity").JobApplication>;
    getAdminJobs(): Promise<import("../../entities/job-post.entity").JobPost[]>;
    createJob(dto: CreateJobPostDto): Promise<import("../../entities/job-post.entity").JobPost>;
    updateJob(id: string, dto: UpdateJobPostDto): Promise<import("../../entities/job-post.entity").JobPost>;
    deleteJob(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getApplications(jobPostId?: string, search?: string): Promise<import("../../entities/job-application.entity").JobApplication[]>;
    updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto): Promise<import("../../entities/job-application.entity").JobApplication>;
    deleteApplication(id: string): Promise<{
        success: boolean;
    }>;
}
