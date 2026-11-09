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
exports.FleetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const equipment_entity_1 = require("../../entities/equipment.entity");
const partner_entity_1 = require("../../entities/partner.entity");
let FleetService = class FleetService {
    constructor(equipmentRepository, partnerRepository) {
        this.equipmentRepository = equipmentRepository;
        this.partnerRepository = partnerRepository;
    }
    async getEquipment() {
        return this.equipmentRepository.find({
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async createEquipment(data) {
        const item = this.equipmentRepository.create(data);
        return this.equipmentRepository.save(item);
    }
    async updateEquipment(id, data) {
        const item = await this.equipmentRepository.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Equipment not found');
        Object.assign(item, data);
        return this.equipmentRepository.save(item);
    }
    async deleteEquipment(id) {
        await this.equipmentRepository.delete(id);
    }
    async getPartners() {
        return this.partnerRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async createPartner(data) {
        const partner = this.partnerRepository.create(data);
        return this.partnerRepository.save(partner);
    }
    async deletePartner(id) {
        await this.partnerRepository.delete(id);
    }
};
exports.FleetService = FleetService;
exports.FleetService = FleetService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(equipment_entity_1.Equipment)),
    __param(1, (0, typeorm_1.InjectRepository)(partner_entity_1.Partner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FleetService);
//# sourceMappingURL=fleet.service.js.map