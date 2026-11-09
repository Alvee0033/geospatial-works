import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/contact.dto';
import { InquiryStatus } from '../../entities/contact-inquiry.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Contact & Quotes')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('inquiry')
  @ApiOperation({ summary: 'Submit client contact or quote inquiry' })
  async createInquiry(@Body() dto: CreateInquiryDto) {
    return this.contactService.createInquiry(dto);
  }

  // Admin Endpoints
  @Get('admin/inquiries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all client inquiries' })
  async getAllInquiries() {
    return this.contactService.getAllInquiries();
  }

  @Put('admin/inquiries/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update inquiry status and internal notes' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InquiryStatus,
    @Body('internalNotes') internalNotes?: string,
  ) {
    return this.contactService.updateStatus(id, status, internalNotes);
  }

  @Delete('admin/inquiries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete an inquiry permanently' })
  async deleteInquiry(@Param('id') id: string) {
    return this.contactService.deleteInquiry(id);
  }
}

