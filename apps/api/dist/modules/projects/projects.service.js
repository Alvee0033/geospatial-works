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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../../entities/project.entity");
let ProjectsService = class ProjectsService {
    constructor(projectRepository) {
        this.projectRepository = projectRepository;
    }
    async findAll(milestonesOnly = false) {
        const where = milestonesOnly ? { isMilestone: true } : {};
        return this.projectRepository.find({
            where,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async findBySlug(slug) {
        const project = await this.projectRepository.findOne({ where: { slug } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with slug '${slug}' not found`);
        }
        return project;
    }
    async create(dto) {
        const existing = await this.projectRepository.findOne({ where: { slug: dto.slug } });
        if (existing) {
            throw new common_1.ConflictException(`Project with slug '${dto.slug}' already exists`);
        }
        const project = this.projectRepository.create(dto);
        return this.projectRepository.save(project);
    }
    async update(id, dto) {
        const project = await this.projectRepository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        Object.assign(project, dto);
        return this.projectRepository.save(project);
    }
    async delete(id) {
        const result = await this.projectRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map