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
exports.JobPost = exports.JobStatus = exports.JobType = void 0;
const typeorm_1 = require("typeorm");
const job_application_entity_1 = require("./job-application.entity");
var JobType;
(function (JobType) {
    JobType["FULL_TIME"] = "Full-time";
    JobType["PART_TIME"] = "Part-time";
    JobType["CONTRACT"] = "Contract";
    JobType["PERMANENT"] = "Full-time / Permanent";
    JobType["INTERNSHIP"] = "Internship";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PUBLISHED"] = "published";
    JobStatus["DRAFT"] = "draft";
    JobStatus["CLOSED"] = "closed";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
let JobPost = class JobPost {
};
exports.JobPost = JobPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], JobPost.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobPost.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobPost.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobPost.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JobType,
        default: JobType.FULL_TIME,
    }),
    __metadata("design:type", String)
], JobPost.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], JobPost.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], JobPost.prototype, "qualifications", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], JobPost.prototype, "responsibilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "experienceLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "salaryRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.PUBLISHED,
    }),
    __metadata("design:type", String)
], JobPost.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], JobPost.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], JobPost.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_application_entity_1.JobApplication, (application) => application.jobPost, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], JobPost.prototype, "applications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], JobPost.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], JobPost.prototype, "updatedAt", void 0);
exports.JobPost = JobPost = __decorate([
    (0, typeorm_1.Entity)('job_posts')
], JobPost);
//# sourceMappingURL=job-post.entity.js.map