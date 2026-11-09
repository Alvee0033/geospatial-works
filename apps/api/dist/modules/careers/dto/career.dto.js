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
exports.UpdateApplicationStatusDto = exports.CreateApplicationDto = exports.UpdateJobPostDto = exports.CreateJobPostDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const job_post_entity_1 = require("../../../entities/job-post.entity");
const job_application_entity_1 = require("../../../entities/job-application.entity");
class CreateJobPostDto {
}
exports.CreateJobPostDto = CreateJobPostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lead Geodetic Surveyor (RTK & Total Station)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'lead-geodetic-surveyor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Geodesy & Ground Survey' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dhaka & Field Locations, Bangladesh' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: job_post_entity_1.JobType, default: job_post_entity_1.JobType.FULL_TIME }),
    (0, class_validator_1.IsEnum)(job_post_entity_1.JobType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lead primary geodetic control networks...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Full detailed job overview and scope of works' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['5+ years hands-on experience'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateJobPostDto.prototype, "qualifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Establish geodetic bench marks'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateJobPostDto.prototype, "responsibilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '5+ years' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Negotiable / Commensurate with experience' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "salaryRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: job_post_entity_1.JobStatus, default: job_post_entity_1.JobStatus.PUBLISHED }),
    (0, class_validator_1.IsEnum)(job_post_entity_1.JobStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJobPostDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateJobPostDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateJobPostDto.prototype, "sortOrder", void 0);
class UpdateJobPostDto {
}
exports.UpdateJobPostDto = UpdateJobPostDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: job_post_entity_1.JobType }),
    (0, class_validator_1.IsEnum)(job_post_entity_1.JobType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateJobPostDto.prototype, "qualifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateJobPostDto.prototype, "responsibilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "salaryRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: job_post_entity_1.JobStatus }),
    (0, class_validator_1.IsEnum)(job_post_entity_1.JobStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJobPostDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateJobPostDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateJobPostDto.prototype, "sortOrder", void 0);
class CreateApplicationDto {
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'job-post-uuid-here' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "jobPostId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alvee Hasan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'alvee@example.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+880 1712 345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://linkedin.com/in/alvee' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "linkedInUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://github.com/alvee' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "portfolioUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Survey Solutions Ltd' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "currentCompany", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Senior GIS Engineer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "currentTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '4 years' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Passionate about geomatics and RTK network adjustments...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "coverLetter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/uploads/resumes/my_resume.pdf' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "resumeUrl", void 0);
class UpdateApplicationStatusDto {
}
exports.UpdateApplicationStatusDto = UpdateApplicationStatusDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: job_application_entity_1.ApplicationStatus }),
    (0, class_validator_1.IsEnum)(job_application_entity_1.ApplicationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "internalNotes", void 0);
//# sourceMappingURL=career.dto.js.map