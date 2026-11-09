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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contact_service_1 = require("./contact.service");
const contact_dto_1 = require("./dto/contact.dto");
const contact_inquiry_entity_1 = require("../../entities/contact-inquiry.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ContactController = class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
    }
    async createInquiry(dto) {
        return this.contactService.createInquiry(dto);
    }
    async getAllInquiries() {
        return this.contactService.getAllInquiries();
    }
    async updateStatus(id, status, internalNotes) {
        return this.contactService.updateStatus(id, status, internalNotes);
    }
    async deleteInquiry(id) {
        return this.contactService.deleteInquiry(id);
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)('inquiry'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit client contact or quote inquiry' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateInquiryDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "createInquiry", null);
__decorate([
    (0, common_1.Get)('admin/inquiries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all client inquiries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "getAllInquiries", null);
__decorate([
    (0, common_1.Put)('admin/inquiries/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update inquiry status and internal notes' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('internalNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)('admin/inquiries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete an inquiry permanently' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "deleteInquiry", null);
exports.ContactController = ContactController = __decorate([
    (0, swagger_1.ApiTags)('Contact & Quotes'),
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map