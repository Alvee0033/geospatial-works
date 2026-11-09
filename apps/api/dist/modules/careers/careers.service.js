"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_post_entity_1 = require("../../entities/job-post.entity");
const job_application_entity_1 = require("../../entities/job-application.entity");
let CareersService = class CareersService {
    constructor(jobPostRepo, applicationRepo) {
        this.jobPostRepo = jobPostRepo;
        this.applicationRepo = applicationRepo;
    }
    async findAllJobs(includeAll = false) {
        const qb = this.jobPostRepo
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.applications', 'applications')
            .loadRelationCountAndMap('job.applicationCount', 'job.applications');
        if (!includeAll) {
            qb.where('job.isActive = :active', { active: true }).andWhere('job.status = :status', {
                status: job_post_entity_1.JobStatus.PUBLISHED,
            });
        }
        return qb.orderBy('job.sortOrder', 'ASC').addOrderBy('job.createdAt', 'DESC').getMany();
    }
    async findJobBySlug(slug) {
        const job = await this.jobPostRepo.findOne({
            where: { slug },
            relations: ['applications'],
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job posting "${slug}" not found`);
        }
        return job;
    }
    async findJobById(id) {
        const job = await this.jobPostRepo.findOne({
            where: { id },
            relations: ['applications'],
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job posting with ID "${id}" not found`);
        }
        return job;
    }
    async createJob(dto) {
        const slug = dto.slug ||
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
    async updateJob(id, dto) {
        const job = await this.findJobById(id);
        Object.assign(job, dto);
        return this.jobPostRepo.save(job);
    }
    async deleteJob(id) {
        const job = await this.findJobById(id);
        await this.jobPostRepo.remove(job);
        return { success: true, message: `Job ${job.title} deleted successfully` };
    }
    async submitApplication(dto) {
        let jobPost = null;
        if (dto.jobPostId) {
            jobPost = await this.jobPostRepo.findOne({ where: { id: dto.jobPostId } });
        }
        const application = this.applicationRepo.create({
            ...dto,
            jobPost: jobPost || undefined,
            status: job_application_entity_1.ApplicationStatus.NEW,
        });
        return this.applicationRepo.save(application);
    }
    async findAllApplications(jobPostId, search) {
        const qb = this.applicationRepo
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.jobPost', 'jobPost');
        if (jobPostId && jobPostId !== 'all') {
            qb.andWhere('app.jobPostId = :jobPostId', { jobPostId });
        }
        if (search && search.trim().length > 0) {
            const q = `%${search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(app.fullName) LIKE :q OR LOWER(app.email) LIKE :q OR LOWER(app.phone) LIKE :q OR LOWER(jobPost.title) LIKE :q)', { q });
        }
        return qb.orderBy('app.createdAt', 'DESC').getMany();
    }
    async updateApplicationStatus(id, dto) {
        const application = await this.applicationRepo.findOne({
            where: { id },
            relations: ['jobPost'],
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID "${id}" not found`);
        }
        if (dto.status !== undefined)
            application.status = dto.status;
        if (dto.internalNotes !== undefined)
            application.internalNotes = dto.internalNotes;
        return this.applicationRepo.save(application);
    }
    async deleteApplication(id) {
        const application = await this.applicationRepo.findOne({ where: { id } });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID "${id}" not found`);
        }
        await this.applicationRepo.remove(application);
        return { success: true };
    }
};
exports.CareersService = CareersService;
exports.CareersService = CareersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_post_entity_1.JobPost)),
    __param(1, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CareersService);
//# sourceMappingURL=careers.service.js.map