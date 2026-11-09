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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroSlide = void 0;
const typeorm_1 = require("typeorm");
let HeroSlide = class HeroSlide {
};
exports.HeroSlide = HeroSlide;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HeroSlide.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'PEOPLE • DATA • RESILIENT BANGLADESH' }),
    __metadata("design:type", String)
], HeroSlide.prototype, "eyebrow", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HeroSlide.prototype, "heading", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], HeroSlide.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HeroSlide.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HeroSlide.prototype, "mediaType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HeroSlide.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Explore Our Services' }),
    __metadata("design:type", String)
], HeroSlide.prototype, "primaryActionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '/services' }),
    __metadata("design:type", String)
], HeroSlide.prototype, "primaryActionHref", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Get in Touch' }),
    __metadata("design:type", String)
], HeroSlide.prototype, "secondaryActionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '/contact' }),
    __metadata("design:type", String)
], HeroSlide.prototype, "secondaryActionHref", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], HeroSlide.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], HeroSlide.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HeroSlide.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], HeroSlide.prototype, "updatedAt", void 0);
exports.HeroSlide = HeroSlide = __decorate([
    (0, typeorm_1.Entity)('hero_slides')
], HeroSlide);
//# sourceMappingURL=hero-slide.entity.js.map