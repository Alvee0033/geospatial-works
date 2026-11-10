"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const user_entity_1 = require("./entities/user.entity");
const hero_slide_entity_1 = require("./entities/hero-slide.entity");
const page_section_entity_1 = require("./entities/page-section.entity");
const service_entity_1 = require("./entities/service.entity");
const project_entity_1 = require("./entities/project.entity");
const equipment_entity_1 = require("./entities/equipment.entity");
const partner_entity_1 = require("./entities/partner.entity");
const contact_inquiry_entity_1 = require("./entities/contact-inquiry.entity");
const team_member_entity_1 = require("./entities/team-member.entity");
const mega_menu_entity_1 = require("./entities/mega-menu.entity");
const article_entity_1 = require("./entities/article.entity");
const job_post_entity_1 = require("./entities/job-post.entity");
const job_application_entity_1 = require("./entities/job-application.entity");
const _1762819200000_CmsContentSource_1 = require("./migrations/1762819200000-CmsContentSource");
const _1762905600000_ProjectsOnlyApprovedSource_1 = require("./migrations/1762905600000-ProjectsOnlyApprovedSource");
const _1794270000000_CorporateOfficeContact_1 = require("./migrations/1794270000000-CorporateOfficeContact");
const auth_module_1 = require("./modules/auth/auth.module");
const cms_module_1 = require("./modules/cms/cms.module");
const services_module_1 = require("./modules/services/services.module");
const projects_module_1 = require("./modules/projects/projects.module");
const fleet_module_1 = require("./modules/fleet/fleet.module");
const contact_module_1 = require("./modules/contact/contact.module");
const media_module_1 = require("./modules/media/media.module");
const team_module_1 = require("./modules/team/team.module");
const articles_module_1 = require("./modules/articles/articles.module");
const careers_module_1 = require("./modules/careers/careers.module");
const seed_module_1 = require("./modules/seed/seed.module");
const users_module_1 = require("./modules/users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 120,
                },
            ]),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DATABASE_HOST', 'localhost'),
                    port: config.get('DATABASE_PORT', 5433),
                    username: config.get('DATABASE_USER', 'alvee'),
                    password: config.get('DATABASE_PASSWORD', ''),
                    database: config.get('DATABASE_NAME', 'geospatial_works_db'),
                    entities: [
                        user_entity_1.User,
                        hero_slide_entity_1.HeroSlide,
                        page_section_entity_1.PageSection,
                        service_entity_1.Service,
                        project_entity_1.Project,
                        equipment_entity_1.Equipment,
                        partner_entity_1.Partner,
                        contact_inquiry_entity_1.ContactInquiry,
                        team_member_entity_1.TeamMember,
                        mega_menu_entity_1.MegaMenu,
                        article_entity_1.Article,
                        job_post_entity_1.JobPost,
                        job_application_entity_1.JobApplication,
                    ],
                    synchronize: process.env.NODE_ENV !== 'production',
                    migrations: [_1762819200000_CmsContentSource_1.CmsContentSource1762819200000, _1762905600000_ProjectsOnlyApprovedSource_1.ProjectsOnlyApprovedSource1762905600000, _1794270000000_CorporateOfficeContact_1.CorporateOfficeContact1794270000000],
                    migrationsRun: process.env.NODE_ENV === 'production',
                    logging: false,
                }),
            }),
            auth_module_1.AuthModule,
            cms_module_1.CmsModule,
            services_module_1.ServicesModule,
            projects_module_1.ProjectsModule,
            fleet_module_1.FleetModule,
            contact_module_1.ContactModule,
            media_module_1.MediaModule,
            team_module_1.TeamModule,
            articles_module_1.ArticlesModule,
            careers_module_1.CareersModule,
            seed_module_1.SeedModule,
            users_module_1.UsersModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map