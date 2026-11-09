import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get projects (optionally filter milestones)' })
  @ApiQuery({ name: 'milestonesOnly', required: false, type: Boolean })
  async findAll(@Query('milestonesOnly') milestonesOnly?: string) {
    return this.projectsService.findAll(milestonesOnly === 'true');
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single project by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  // Admin Endpoints
  @Post('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new project' })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update an existing project' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a project' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}

