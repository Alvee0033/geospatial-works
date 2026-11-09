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
exports.UpdateHeroSlideDto = exports.CreateHeroSlideDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateHeroSlideDto {
}
exports.CreateHeroSlideDto = CreateHeroSlideDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PEOPLE • DATA • RESILIENT BANGLADESH' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "eyebrow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Know the Ground. Shape the Future.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Precision geospatial surveying and spatial intelligence across Bangladesh.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/delta-hero-v2.webp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image', enum: ['image', 'video'], required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/hero-video.mp4', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Explore Our Services' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "primaryActionText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/services' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "primaryActionHref", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Get in Touch' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "secondaryActionText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/contact' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHeroSlideDto.prototype, "secondaryActionHref", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateHeroSlideDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateHeroSlideDto.prototype, "isActive", void 0);
class UpdateHeroSlideDto extends CreateHeroSlideDto {
}
exports.UpdateHeroSlideDto = UpdateHeroSlideDto;
//# sourceMappingURL=hero-slide.dto.js.map