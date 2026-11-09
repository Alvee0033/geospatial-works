"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../entities/user.entity");
const hero_slide_entity_1 = require("../../entities/hero-slide.entity");
const page_section_entity_1 = require("../../entities/page-section.entity");
const service_entity_1 = require("../../entities/service.entity");
const project_entity_1 = require("../../entities/project.entity");
const equipment_entity_1 = require("../../entities/equipment.entity");
const partner_entity_1 = require("../../entities/partner.entity");
const job_post_entity_1 = require("../../entities/job-post.entity");
const job_application_entity_1 = require("../../entities/job-application.entity");
const seed_service_1 = require("./seed.service");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                hero_slide_entity_1.HeroSlide,
                page_section_entity_1.PageSection,
                service_entity_1.Service,
                project_entity_1.Project,
                equipment_entity_1.Equipment,
                partner_entity_1.Partner,
                job_post_entity_1.JobPost,
                job_application_entity_1.JobApplication,
            ]),
        ],
        providers: [seed_service_1.SeedService],
        exports: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map