import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Entities
import { User } from './entities/user.entity';
import { HeroSlide } from './entities/hero-slide.entity';
import { PageSection } from './entities/page-section.entity';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { Equipment } from './entities/equipment.entity';
import { Partner } from './entities/partner.entity';
import { ContactInquiry } from './entities/contact-inquiry.entity';
import { TeamMember } from './entities/team-member.entity';
import { MegaMenu } from './entities/mega-menu.entity';
import { Article } from './entities/article.entity';
import { JobPost } from './entities/job-post.entity';
import { JobApplication } from './entities/job-application.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { CmsModule } from './modules/cms/cms.module';
import { ServicesModule } from './modules/services/services.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { ContactModule } from './modules/contact/contact.module';
import { MediaModule } from './modules/media/media.module';
import { TeamModule } from './modules/team/team.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { CareersModule } from './modules/careers/careers.module';
import { SeedModule } from './modules/seed/seed.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5433),
        username: config.get<string>('DATABASE_USER', 'alvee'),
        password: config.get<string>('DATABASE_PASSWORD', ''),
        database: config.get<string>('DATABASE_NAME', 'geospatial_works_db'),
        entities: [
          User,
          HeroSlide,
          PageSection,
          Service,
          Project,
          Equipment,
          Partner,
          ContactInquiry,
          TeamMember,
          MegaMenu,
          Article,
          JobPost,
          JobApplication,
        ],
        synchronize: true, // Auto schema sync
        logging: false,
      }),
    }),
    AuthModule,
    CmsModule,
    ServicesModule,
    ProjectsModule,
    FleetModule,
    ContactModule,
    MediaModule,
    TeamModule,
    ArticlesModule,
    CareersModule,
    SeedModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
