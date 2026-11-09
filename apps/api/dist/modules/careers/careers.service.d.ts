import { Repository } from 'typeorm';
import { JobPost } from '../../entities/job-post.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { CreateJobPostDto, UpdateJobPostDto, CreateApplicationDto, UpdateApplicationStatusDto } from './dto/career.dto';
export declare class CareersService {
    private readonly jobPostRepo;
    private readonly applicationRepo;
    constructor(jobPostRepo: Repository<JobPost>, applicationRepo: Repository<JobApplication>);
    findAllJobs(includeAll?: boolean): Promise<JobPost[]>;
    findJobBySlug(slug: string): Promise<JobPost>;
    findJobById(id: string): Promise<JobPost>;
    createJob(dto: CreateJobPostDto): Promise<JobPost>;
    updateJob(id: string, dto: UpdateJobPostDto): Promise<JobPost>;
    deleteJob(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitApplication(dto: CreateApplicationDto): Promise<JobApplication>;
    findAllApplications(jobPostId?: string, search?: string): Promise<JobApplication[]>;
    updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto): Promise<JobApplication>;
    deleteApplication(id: string): Promise<{
        success: boolean;
    }>;
}
