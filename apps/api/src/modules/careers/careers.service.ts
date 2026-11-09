import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPost, JobStatus } from '../../entities/job-post.entity';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import {
  CreateJobPostDto,
  UpdateJobPostDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/career.dto';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(JobPost)
    private readonly jobPostRepo: Repository<JobPost>,
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
  ) {}

  // ===================== JOB POSTS =====================
  async findAllJobs(includeAll = false): Promise<JobPost[]> {
    const qb = this.jobPostRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.applications', 'applications')
      .loadRelationCountAndMap('job.applicationCount', 'job.applications');

    if (!includeAll) {
      qb.where('job.isActive = :active', { active: true }).andWhere('job.status = :status', {
        status: JobStatus.PUBLISHED,
      });
    }

    return qb.orderBy('job.sortOrder', 'ASC').addOrderBy('job.createdAt', 'DESC').getMany();
  }

  async findJobBySlug(slug: string): Promise<JobPost> {
    const job = await this.jobPostRepo.findOne({
      where: { slug },
      relations: ['applications'],
    });
    if (!job) {
      throw new NotFoundException(`Job posting "${slug}" not found`);
    }
    return job;
  }

  async findJobById(id: string): Promise<JobPost> {
    const job = await this.jobPostRepo.findOne({
      where: { id },
      relations: ['applications'],
    });
    if (!job) {
      throw new NotFoundException(`Job posting with ID "${id}" not found`);
    }
    return job;
  }

  async createJob(dto: CreateJobPostDto): Promise<JobPost> {
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const job = this.jobPostRepo.create({
      ...dto,
      slug,
    });
    return this.jobPostRepo.save(job);
  }

  async updateJob(id: string, dto: UpdateJobPostDto): Promise<JobPost> {
    const job = await this.findJobById(id);
    Object.assign(job, dto);
    return this.jobPostRepo.save(job);
  }

  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findJobById(id);
    await this.jobPostRepo.remove(job);
    return { success: true, message: `Job ${job.title} deleted successfully` };
  }

  // ===================== APPLICATIONS =====================
  async submitApplication(dto: CreateApplicationDto): Promise<JobApplication> {
    let jobPost: JobPost | null = null;
    if (dto.jobPostId) {
      jobPost = await this.jobPostRepo.findOne({ where: { id: dto.jobPostId } });
    }

    const application = this.applicationRepo.create({
      ...dto,
      jobPost: jobPost || undefined,
      status: ApplicationStatus.NEW,
    });

    return this.applicationRepo.save(application);
  }

  async findAllApplications(jobPostId?: string, search?: string): Promise<JobApplication[]> {
    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.jobPost', 'jobPost');

    if (jobPostId && jobPostId !== 'all') {
      qb.andWhere('app.jobPostId = :jobPostId', { jobPostId });
    }

    if (search && search.trim().length > 0) {
      const q = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(app.fullName) LIKE :q OR LOWER(app.email) LIKE :q OR LOWER(app.phone) LIKE :q OR LOWER(jobPost.title) LIKE :q)',
        { q },
      );
    }

    return qb.orderBy('app.createdAt', 'DESC').getMany();
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto): Promise<JobApplication> {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: ['jobPost'],
    });
    if (!application) {
      throw new NotFoundException(`Application with ID "${id}" not found`);
    }

    if (dto.status !== undefined) application.status = dto.status;
    if (dto.internalNotes !== undefined) application.internalNotes = dto.internalNotes;

    return this.applicationRepo.save(application);
  }

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    const application = await this.applicationRepo.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID "${id}" not found`);
    }
    await this.applicationRepo.remove(application);
    return { success: true };
  }
}
