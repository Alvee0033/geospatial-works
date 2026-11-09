import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { HeroSlide } from '../../entities/hero-slide.entity';
import { PageSection } from '../../entities/page-section.entity';
import { Service } from '../../entities/service.entity';
import { Project } from '../../entities/project.entity';
import { Equipment } from '../../entities/equipment.entity';
import { Partner } from '../../entities/partner.entity';
import { JobPost } from '../../entities/job-post.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      HeroSlide,
      PageSection,
      Service,
      Project,
      Equipment,
      Partner,
      JobPost,
      JobApplication,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

