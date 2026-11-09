import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Team & Engineers')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active team members (Public)' })
  async getActive() {
    return this.teamService.findAllActive();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single team member by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.teamService.findBySlug(slug);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all team members including drafts' })
  async getAllAdmin() {
    return this.teamService.findAllAdmin();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new team member' })
  async create(@Body() dto: CreateTeamMemberDto) {
    return this.teamService.create(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update a team member' })
  async update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.teamService.update(id, dto);
  }

  @Put('admin/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Reorder team members' })
  async reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.teamService.reorder(items);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a team member' })
  async remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}

