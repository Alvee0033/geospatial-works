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
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const team_service_1 = require("./team.service");
const team_member_dto_1 = require("./dto/team-member.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TeamController = class TeamController {
    constructor(teamService) {
        this.teamService = teamService;
    }
    async getActive() {
        return this.teamService.findAllActive();
    }
    async getBySlug(slug) {
        return this.teamService.findBySlug(slug);
    }
    async getAllAdmin() {
        return this.teamService.findAllAdmin();
    }
    async create(dto) {
        return this.teamService.create(dto);
    }
    async update(id, dto) {
        return this.teamService.update(id, dto);
    }
    async reorder(items) {
        return this.teamService.reorder(items);
    }
    async remove(id) {
        return this.teamService.remove(id);
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active team members (Public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single team member by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getBySlug", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all team members including drafts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAllAdmin", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create a new team member' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [team_member_dto_1.CreateTeamMemberDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update a team member' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_member_dto_1.UpdateTeamMemberDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('admin/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Reorder team members' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a team member' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "remove", null);
exports.TeamController = TeamController = __decorate([
    (0, swagger_1.ApiTags)('Team & Engineers'),
    (0, common_1.Controller)('team'),
    __metadata("design:paramtypes", [team_service_1.TeamService])
], TeamController);
//# sourceMappingURL=team.controller.js.map