import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero-slide.dto';
import { UpdatePageSectionDto } from './dto/page-section.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('CMS & Page Content')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // Public Endpoints
  @Get('landing-page')
  @ApiOperation({ summary: 'Get complete dynamic landing page content package' })
  async getLandingPageData() {
    return this.cmsService.getLandingPageData();
  }

  @Get('hero-slides')
  @ApiOperation({ summary: 'Get active hero carousel slides' })
  async getActiveHeroSlides() {
    return this.cmsService.getActiveHeroSlides();
  }

  @Get('sections/:pageKey')
  @ApiOperation({ summary: 'Get all active sections for a specific page' })
  async getSectionsByPage(@Param('pageKey') pageKey: string) {
    return this.cmsService.getSectionsByPage(pageKey);
  }

  // Admin CMS Endpoints
  @Get('admin/hero-slides')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all hero slides (active and inactive)' })
  async getAllHeroSlides() {
    return this.cmsService.getAllHeroSlides();
  }

  @Post('admin/hero-slides')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new hero carousel slide' })
  async createHeroSlide(@Body() dto: CreateHeroSlideDto) {
    return this.cmsService.createHeroSlide(dto);
  }

  @Put('admin/hero-slides/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update an existing hero slide' })
  async updateHeroSlide(@Param('id') id: string, @Body() dto: UpdateHeroSlideDto) {
    return this.cmsService.updateHeroSlide(id, dto);
  }

  @Delete('admin/hero-slides/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a hero slide' })
  async deleteHeroSlide(@Param('id') id: string) {
    return this.cmsService.deleteHeroSlide(id);
  }

  @Get('admin/sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all page sections' })
  async getAllSections() {
    return this.cmsService.getAllSections();
  }

  @Put('admin/sections/:pageKey/:sectionKey')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update or create a page section' })
  async updateSection(
    @Param('pageKey') pageKey: string,
    @Param('sectionKey') sectionKey: string,
    @Body() dto: UpdatePageSectionDto,
  ) {
    return this.cmsService.updateSection(pageKey, sectionKey, dto);
  }
}

