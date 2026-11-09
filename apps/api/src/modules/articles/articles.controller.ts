import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('News & Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published news and technical bulletins' })
  @ApiQuery({ name: 'publishedOnly', required: false, type: Boolean })
  async findAll(@Query('publishedOnly') publishedOnly?: string) {
    return this.articlesService.findAll(publishedOnly !== 'false');
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single news article by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create news or bulletin' })
  async create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update news article' })
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete news article' })
  async remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}

