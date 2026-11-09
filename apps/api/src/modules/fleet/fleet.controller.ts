import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Fleet & Partners')
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('equipment')
  @ApiOperation({ summary: 'List physical hardware, drones, total stations, and computing resources' })
  async getEquipment() {
    return this.fleetService.getEquipment();
  }

  @Get('partners')
  @ApiOperation({ summary: 'List client and institutional partners' })
  async getPartners() {
    return this.fleetService.getPartners();
  }

  // Admin Endpoints
  @Post('admin/equipment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Add equipment item' })
  async createEquipment(@Body() data: any) {
    return this.fleetService.createEquipment(data);
  }

  @Put('admin/equipment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update equipment item' })
  async updateEquipment(@Param('id') id: string, @Body() data: any) {
    return this.fleetService.updateEquipment(id, data);
  }

  @Delete('admin/equipment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete equipment item' })
  async deleteEquipment(@Param('id') id: string) {
    return this.fleetService.deleteEquipment(id);
  }

  @Post('admin/partners')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Add partner' })
  async createPartner(@Body() data: any) {
    return this.fleetService.createPartner(data);
  }

  @Delete('admin/partners/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete partner' })
  async deletePartner(@Param('id') id: string) {
    return this.fleetService.deletePartner(id);
  }
}

