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
import { CmsContentSource1762819200000 } from './migrations/1762819200000-CmsContentSource';
import { ProjectsOnlyApprovedSource1762905600000 } from './migrations/1762905600000-ProjectsOnlyApprovedSource';
import { CorporateOfficeContact1794270000000 } from './migrations/1794270000000-CorporateOfficeContact';
import { ContentDetailFields1794325484540 } from './migrations/1794325484540-ContentDetailFields';

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
import { ClientContact } from './entities/client-contact.entity';
import { InboxConversation } from './entities/inbox-conversation.entity';
import { InboxMessage } from './entities/inbox-message.entity';
import { GmailInboxConnection } from './entities/gmail-connection.entity';
import { ExternalInbox1794470400000 } from './migrations/1794470400000-ExternalInbox';
import { ClientsModule } from './modules/clients/clients.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { ClientMessagingContacts1794384000000 } from './migrations/1794384000000-ClientMessagingContacts';
import { GmailInbox1794556800000 } from './migrations/1794556800000-GmailInbox';
import { MetaInboxConnection } from './entities/meta-inbox-connection.entity';
import { MetaInboxConnections1794643200000 } from './migrations/1794643200000-MetaInboxConnections';

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
          ClientContact,
          InboxConversation,
          InboxMessage,
          GmailInboxConnection,
          MetaInboxConnection,
        ],
        // Never mutate a database schema implicitly at startup. Use a reviewed
        // migration, or explicitly opt in to synchronization for a throwaway DB.
        synchronize: config.get<string>('DATABASE_SYNCHRONIZE') === 'true' && process.env.NODE_ENV !== 'production',
        migrations: [
          CmsContentSource1762819200000,
          ProjectsOnlyApprovedSource1762905600000,
          CorporateOfficeContact1794270000000,
          ContentDetailFields1794325484540,
          ClientMessagingContacts1794384000000,
          ExternalInbox1794470400000,
          GmailInbox1794556800000,
          MetaInboxConnections1794643200000,
        ],
        migrationsRun: config.get<string>('DATABASE_MIGRATIONS_RUN') === 'true',
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
    ClientsModule,
    InboxModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
