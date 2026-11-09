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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_member_entity_1 = require("../../entities/team-member.entity");
let TeamService = class TeamService {
    constructor(teamRepository) {
        this.teamRepository = teamRepository;
    }
    async findAllActive() {
        return this.teamRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', createdAt: 'ASC' },
        });
    }
    async findAllAdmin() {
        return this.teamRepository.find({
            order: { sortOrder: 'ASC', createdAt: 'ASC' },
        });
    }
    async findBySlug(slug) {
        const member = await this.teamRepository.findOne({ where: { slug } });
        if (!member)
            throw new common_1.NotFoundException(`Team member with slug ${slug} not found`);
        return member;
    }
    async create(dto) {
        const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newMember = this.teamRepository.create({ ...dto, slug });
        return this.teamRepository.save(newMember);
    }
    async update(id, dto) {
        const member = await this.teamRepository.findOne({ where: { id } });
        if (!member)
            throw new common_1.NotFoundException(`Team member not found`);
        Object.assign(member, dto);
        return this.teamRepository.save(member);
    }
    async remove(id) {
        const result = await this.teamRepository.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Team member not found`);
    }
    async reorder(items) {
        for (const item of items) {
            await this.teamRepository.update(item.id, { sortOrder: item.sortOrder });
        }
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TeamService);
//# sourceMappingURL=team.service.js.map