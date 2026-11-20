import { Body, Controller, Get, Headers, HttpCode, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplyDto } from './dto/reply.dto';
import { InboxService } from './inbox.service';
import { GmailInboxService } from './gmail.service';

@ApiTags('Inbox')
@Controller('inbox')
export class InboxController {
  constructor(private readonly inbox: InboxService, private readonly gmail: GmailInboxService) {}

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getConfiguration() { return this.inbox.getConfiguration(); }

  @Post('admin/gmail/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  startGmailAuthorization(@Req() request: Request & { user: { id: string } }) {
    return this.gmail.startAuthorization(request.user.id);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  listConversations() { return this.inbox.listConversations(); }

  @Get('admin/conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMessages(@Param('id') id: string) { return this.inbox.getMessages(id); }

  @Post('admin/conversations/:id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  sendReply(@Param('id') id: string, @Body() body: ReplyDto) { return this.inbox.sendReply(id, body.text); }
}
