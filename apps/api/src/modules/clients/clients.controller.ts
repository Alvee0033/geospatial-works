import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClientContactDto } from './dto/client-contact.dto';
import { ClientsService } from './clients.service';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('admin/all')
  @ApiOperation({ summary: 'Admin: List saved client messaging details' })
  findAll() {
    return this.clientsService.findAll();
  }

  @Post('admin')
  @ApiOperation({ summary: 'Admin: Add WhatsApp or Messenger contact details for a client' })
  create(@Body() dto: ClientContactDto) {
    return this.clientsService.create(dto);
  }

  @Put('admin/:id')
  @ApiOperation({ summary: 'Admin: Update a client messaging contact' })
  update(@Param('id') id: string, @Body() dto: ClientContactDto) {
    return this.clientsService.update(id, dto);
  }
}
