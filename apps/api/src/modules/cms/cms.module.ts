import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from '../../entities/hero-slide.entity';
import { PageSection } from '../../entities/page-section.entity';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HeroSlide, PageSection])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}

