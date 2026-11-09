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
exports.JobApplication = exports.ApplicationStatus = void 0;
const typeorm_1 = require("typeorm");
const job_post_entity_1 = require("./job-post.entity");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["NEW"] = "new";
    ApplicationStatus["REVIEWING"] = "reviewing";
    ApplicationStatus["SHORTLISTED"] = "shortlisted";
    ApplicationStatus["INTERVIEWED"] = "interviewed";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["HIRED"] = "hired";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
let JobApplication = class JobApplication {
};
exports.JobApplication = JobApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "jobPostId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_post_entity_1.JobPost, (job) => job.applications, {
        onDelete: 'SET NULL',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'jobPostId' }),
    __metadata("design:type", job_post_entity_1.JobPost)
], JobApplication.prototype, "jobPost", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobApplication.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobApplication.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobApplication.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "linkedInUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "portfolioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "currentCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "currentTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "coverLetter", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "resumeUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.NEW,
    }),
    __metadata("design:type", String)
], JobApplication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], JobApplication.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], JobApplication.prototype, "updatedAt", void 0);
exports.JobApplication = JobApplication = __decorate([
    (0, typeorm_1.Entity)('job_applications')
], JobApplication);
//# sourceMappingURL=job-application.entity.js.map