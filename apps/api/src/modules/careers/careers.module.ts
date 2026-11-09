import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPost } from '../../entities/job-post.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, JobApplication])],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
