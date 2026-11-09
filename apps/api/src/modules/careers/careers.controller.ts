import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CareersService } from './careers.service';
import {
  CreateJobPostDto,
  UpdateJobPostDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/career.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Careers & Applications')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  // ==================== PUBLIC ENDPOINTS ====================
  @Get('jobs')
  @ApiOperation({ summary: 'Get all active published jobs' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  async getJobs(@Query('all') all?: string) {
    return this.careersService.findAllJobs(all === 'true');
  }

  @Get('jobs/:slug')
  @ApiOperation({ summary: 'Get single job posting details' })
  async getJobBySlug(@Param('slug') slug: string) {
    return this.careersService.findJobBySlug(slug);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Submit a job application' })
  async submitApplication(@Body() dto: CreateApplicationDto) {
    return this.careersService.submitApplication(dto);
  }

  // ==================== ADMIN ENDPOINTS ====================
  @Get('admin/jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all jobs including draft and closed' })
  async getAdminJobs() {
    return this.careersService.findAllJobs(true);
  }

  @Post('admin/jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new job opening' })
  async createJob(@Body() dto: CreateJobPostDto) {
    return this.careersService.createJob(dto);
  }

  @Put('admin/jobs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update an existing job opening' })
  async updateJob(@Param('id') id: string, @Body() dto: UpdateJobPostDto) {
    return this.careersService.updateJob(id, dto);
  }

  @Delete('admin/jobs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a job opening' })
  async deleteJob(@Param('id') id: string) {
    return this.careersService.deleteJob(id);
  }

  @Get('admin/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List applications with optional job filter & candidate search' })
  @ApiQuery({ name: 'jobPostId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getApplications(
    @Query('jobPostId') jobPostId?: string,
    @Query('search') search?: string,
  ) {
    return this.careersService.findAllApplications(jobPostId, search);
  }

  @Put('admin/applications/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update application status or internal notes' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.careersService.updateApplicationStatus(id, dto);
  }

  @Delete('admin/applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete an application' })
  async deleteApplication(@Param('id') id: string) {
    return this.careersService.deleteApplication(id);
  }
}
