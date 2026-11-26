import { BadRequestException, Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplyDto } from './dto/reply.dto';
import { InboxService } from './inbox.service';
import { GmailInboxService } from './gmail.service';
import { MetaConnectionService } from './meta-connection.service';
import { MetaCodeDto, MetaPageDto, MetaWhatsAppDto } from './dto/meta-connect.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Inbox')
@Controller('inbox')
export class InboxController {
  constructor(private readonly inbox: InboxService, private readonly gmail: GmailInboxService, private readonly meta: MetaConnectionService) {}

  @Get('webhook')
  @ApiOperation({ summary: 'Meta webhook subscription verification' })
  verifyWebhook(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    return this.inbox.verifySubscription(mode, token, challenge);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive signed Meta messages webhook events' })
  async receiveWebhook(@Req() request: Request & { rawBody?: Buffer }, @Headers('x-hub-signature-256') signature: string, @Body() payload: unknown) {
    this.inbox.verifySignature(request.rawBody, signature);
    await this.inbox.receive(payload);
    return 'EVENT_RECEIVED';
  }

  @Get('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  getConfiguration() { return this.inbox.getConfiguration(); }

  @Post('admin/gmail/connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  startGmailAuthorization(@Req() request: Request & { user: { id: string } }) {
    return this.gmail.startAuthorization(request.user.id);
  }

  @Delete('admin/gmail/connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  disconnectGmail() { return this.gmail.disconnect(); }

  @Post('admin/meta/messenger/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  beginMessenger(@Body() dto: MetaCodeDto, @Req() request: Request & { user: { id: string } }) {
    return this.meta.beginMessenger(dto.code, request.user.id);
  }

  @Post('admin/meta/messenger/select')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  selectMessenger(@Body() dto: MetaPageDto, @Req() request: Request & { user: { id: string } }) {
    return this.meta.selectMessenger(dto.selectionToken, dto.pageId, request.user.id);
  }

  @Post('admin/meta/whatsapp/connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  connectWhatsApp(@Body() dto: MetaWhatsAppDto) {
    return this.meta.connectWhatsApp(dto.code, dto.wabaId, dto.phoneNumberId, dto.pin, dto.isOnBizApp);
  }

  @Delete('admin/meta/:channel/connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  disconnectMeta(@Param('channel') channel: string) {
    if (channel !== 'whatsapp' && channel !== 'messenger') throw new BadRequestException('Unsupported channel');
    return this.meta.disconnect(channel === 'whatsapp' ? 'WHATSAPP' : 'MESSENGER');
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Complete Google Gmail authorization' })
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Query('error') oauthError: string, @Res() response: Response) {
    if (oauthError) return response.status(400).send('Gmail connection was cancelled. You can close this page.');
    if (!code || !state) return response.status(400).send('Missing Google authorization details.');
    try {
      return response.redirect(303, await this.gmail.finishAuthorization(code, state));
    } catch {
      return response.status(400).send('Gmail could not be connected. Return to the admin inbox and check OAuth configuration.');
    }
  }

  @Get('admin/conversations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  listConversations() { return this.inbox.listConversations(); }

  @Get('admin/conversations/:id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  getMessages(@Param('id') id: string) { return this.inbox.getMessages(id); }

  @Post('admin/conversations/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  sendReply(@Param('id') id: string, @Body() body: ReplyDto) { return this.inbox.sendReply(id, body.text); }
}
