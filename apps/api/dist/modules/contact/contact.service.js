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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_inquiry_entity_1 = require("../../entities/contact-inquiry.entity");
let ContactService = class ContactService {
    constructor(inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }
    async createInquiry(dto) {
        const inquiry = this.inquiryRepository.create(dto);
        return this.inquiryRepository.save(inquiry);
    }
    async getAllInquiries() {
        return this.inquiryRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, status, internalNotes) {
        const inquiry = await this.inquiryRepository.findOne({ where: { id } });
        if (!inquiry)
            throw new common_1.NotFoundException('Inquiry not found');
        inquiry.status = status;
        if (internalNotes !== undefined)
            inquiry.internalNotes = internalNotes;
        return this.inquiryRepository.save(inquiry);
    }
    async deleteInquiry(id) {
        const inquiry = await this.inquiryRepository.findOne({ where: { id } });
        if (!inquiry)
            throw new common_1.NotFoundException('Inquiry not found');
        await this.inquiryRepository.remove(inquiry);
        return { success: true, id };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_inquiry_entity_1.ContactInquiry)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContactService);
//# sourceMappingURL=contact.service.js.map