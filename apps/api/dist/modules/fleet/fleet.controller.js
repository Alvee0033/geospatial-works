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
exports.FleetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fleet_service_1 = require("./fleet.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FleetController = class FleetController {
    constructor(fleetService) {
        this.fleetService = fleetService;
    }
    async getEquipment() {
        return this.fleetService.getEquipment();
    }
    async getPartners() {
        return this.fleetService.getPartners();
    }
    async createEquipment(data) {
        return this.fleetService.createEquipment(data);
    }
    async updateEquipment(id, data) {
        return this.fleetService.updateEquipment(id, data);
    }
    async deleteEquipment(id) {
        return this.fleetService.deleteEquipment(id);
    }
    async createPartner(data) {
        return this.fleetService.createPartner(data);
    }
    async deletePartner(id) {
        return this.fleetService.deletePartner(id);
    }
};
exports.FleetController = FleetController;
__decorate([
    (0, common_1.Get)('equipment'),
    (0, swagger_1.ApiOperation)({ summary: 'List physical hardware, drones, total stations, and computing resources' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getEquipment", null);
__decorate([
    (0, common_1.Get)('partners'),
    (0, swagger_1.ApiOperation)({ summary: 'List client and institutional partners' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getPartners", null);
__decorate([
    (0, common_1.Post)('admin/equipment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Add equipment item' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "createEquipment", null);
__decorate([
    (0, common_1.Put)('admin/equipment/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update equipment item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "updateEquipment", null);
__decorate([
    (0, common_1.Delete)('admin/equipment/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete equipment item' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "deleteEquipment", null);
__decorate([
    (0, common_1.Post)('admin/partners'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Add partner' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "createPartner", null);
__decorate([
    (0, common_1.Delete)('admin/partners/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete partner' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "deletePartner", null);
exports.FleetController = FleetController = __decorate([
    (0, swagger_1.ApiTags)('Fleet & Partners'),
    (0, common_1.Controller)('fleet'),
    __metadata("design:paramtypes", [fleet_service_1.FleetService])
], FleetController);
//# sourceMappingURL=fleet.controller.js.map