import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/contact.dto';
import { InquiryStatus } from '../../entities/contact-inquiry.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all client inquiries' })
  async getAllInquiries() {
    return this.contactService.getAllInquiries();
  }

  @Put('admin/inquiries/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update inquiry status and internal notes' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InquiryStatus,
    @Body('internalNotes') internalNotes?: string,
  ) {
    return this.contactService.updateStatus(id, status, internalNotes);
  }

  @Post('admin/inquiries/:id/reply-cv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Admin: Send direct CV email reply with optional file attachment' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async replyWithCv(
    @Param('id') id: string,
    @Body('subject') subject?: string,
    @Body('message') message?: string,
    @Body('markResolved') markResolved?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.contactService.replyWithCv(
      id,
      {
        subject,
        message,
        markResolved: markResolved !== 'false',
      },
      file,
    );
  }

  @Delete('admin/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete an inquiry permanently' })
  async deleteInquiry(@Param('id') id: string) {
    return this.contactService.deleteInquiry(id);
  }
}

