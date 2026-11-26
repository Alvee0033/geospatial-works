import { Injectable, BadRequestException, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { InboxChannel, InboxConversation } from '../../entities/inbox-conversation.entity';
import { InboxMessage } from '../../entities/inbox-message.entity';
import { GmailInboxService } from './gmail.service';
import { MetaConnectionService } from './meta-connection.service';
import { InboxChannelSettings, InboxSettingsService } from './inbox-settings.service';

const asString = (value: unknown) => typeof value === 'string' ? value : '';
const dateFromSeconds = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? new Date(n * 1000) : new Date();
};

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(InboxConversation) private readonly conversations: Repository<InboxConversation>,
    @InjectRepository(InboxMessage) private readonly messages: Repository<InboxMessage>,
    private readonly config: ConfigService,
    private readonly gmail: GmailInboxService,
    private readonly meta: MetaConnectionService,
    private readonly settings: InboxSettingsService,
  ) {}

  private lastMessengerSync = 0;

  async saveSetup(body: Partial<InboxChannelSettings>) {
    await this.settings.save(body);
    if (body.messengerPageId || body.messengerPageAccessToken) {
      await this.syncMessengerHistory(true).catch(() => undefined);
    }
    return this.getConfiguration();
  }

  async syncMessengerHistory(force = false): Promise<void> {
    if (!force && Date.now() - this.lastMessengerSync < 15_000) return;
    this.lastMessengerSync = Date.now();
    const conn = await this.meta.connection('MESSENGER').catch(() => null);
    const pageId = conn?.assetId || this.settings.get('messengerPageId', 'MESSENGER_PAGE_ID');
    const token = conn?.accessToken || this.settings.get('messengerPageAccessToken', 'MESSENGER_PAGE_ACCESS_TOKEN');
    if (!pageId || !token) return;

    const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/conversations?fields=participants,updated_time,messages.limit(20){id,message,from,created_time}&limit=25`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    }).catch(() => null);
    if (!res?.ok) return;
    const json: any = await res.json().catch(() => null);
    const threads = Array.isArray(json?.data) ? json.data : [];

    for (const thread of threads) {
      const participants = Array.isArray(thread?.participants?.data) ? thread.participants.data : [];
      const customer = participants.find((p: any) => p?.id && p.id !== pageId);
      const participantId = asString(customer?.id);
      if (!participantId) continue;
      const participantName = asString(customer?.name) || null;
      const msgs = Array.isArray(thread?.messages?.data) ? [...thread.messages.data].reverse() : [];
      for (const m of msgs) {
        const mid = asString(m?.id);
        const txt = asString(m?.message).trim() || '[Attachment]';
        if (!mid) continue;
        const sentAt = m?.created_time ? new Date(m.created_time) : new Date();
        const fromBiz = asString(m?.from?.id) === pageId;
        if (await this.messages.exist({ where: { providerMessageId: mid } })) continue;
        await this.conversations.manager.transaction(async (manager) => {
          const convRepo = manager.getRepository(InboxConversation);
          const msgRepo = manager.getRepository(InboxMessage);
          if (await msgRepo.exist({ where: { providerMessageId: mid } })) return;
          let conv = await convRepo.findOne({ where: { channel: InboxChannel.MESSENGER, businessAssetId: pageId, participantId } });
          if (!conv) {
            conv = convRepo.create({ channel: InboxChannel.MESSENGER, businessAssetId: pageId, participantId, participantName, unreadCount: 0, active: true });
          }
          if (participantName) conv.participantName = participantName;
          conv.lastMessagePreview = txt.slice(0, 500);
          conv.lastMessageAt = sentAt;
          if (!fromBiz) conv.lastInboundAt = sentAt;
          conv = await convRepo.save(conv);
          await msgRepo.insert({ conversationId: conv.id, channel: InboxChannel.MESSENGER, providerMessageId: mid, text: txt, fromBusiness: fromBiz, sentAt });
        }).catch(() => undefined);
      }
    }
  }

  async getConfiguration() {
    const gmail = await this.gmail.status();
    const [whatsapp, messenger] = await Promise.all([this.meta.status('WHATSAPP'), this.meta.status('MESSENGER')]);
    const setup = this.meta.setup();
    return {
      whatsapp: whatsapp.connected || Boolean(this.settings.get('whatsappAccessToken', 'WHATSAPP_ACCESS_TOKEN') && this.settings.get('whatsappPhoneNumberId', 'WHATSAPP_PHONE_NUMBER_ID')),
      messenger: messenger.connected || Boolean(this.settings.get('messengerPageAccessToken', 'MESSENGER_PAGE_ACCESS_TOKEN') && this.settings.get('messengerPageId', 'MESSENGER_PAGE_ID')),
      meta: { ...setup, whatsapp, messenger },
      gmail,
      callbackPath: '/api/v1/inbox/webhook',
      verifyToken: this.settings.get('metaWebhookVerifyToken', 'META_WEBHOOK_VERIFY_TOKEN'),
    };
  }

  verifySubscription(mode: string, token: string, challenge: string): string {
    const configuredTokens = [
      this.settings.get('metaWebhookVerifyToken', 'META_WEBHOOK_VERIFY_TOKEN'),
      this.config.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),
      this.config.get<string>('MESSENGER_WEBHOOK_VERIFY_TOKEN'),
    ].filter(Boolean);
    if (mode === 'subscribe' && configuredTokens.includes(token)) return challenge;
    throw new UnauthorizedException('Webhook verification failed');
  }

  verifySignature(rawBody: Buffer | undefined, signature: string | undefined): void {
    const secret = this.settings.get('metaAppSecret', 'META_APP_SECRET');
    if (!secret) throw new ServiceUnavailableException('META_APP_SECRET is not configured');
    if (!rawBody || !signature?.startsWith('sha256=')) throw new UnauthorizedException('Missing webhook signature');
    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid webhook signature');
  }

  async receive(payload: any): Promise<void> {
    if (payload?.object === 'whatsapp_business_account') return this.receiveWhatsApp(payload);
    if (payload?.object === 'page') return this.receiveMessenger(payload);
    // Acknowledge Meta event types we do not use to avoid repeated retries.
  }

  private async receiveWhatsApp(payload: any) {
    const active = await this.meta.connection('WHATSAPP');
    const allowedPhone = active?.assetId || this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    if (!allowedPhone) return;
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const value = change.value || {};
        const assetId = asString(value.metadata?.phone_number_id);
        if (assetId !== allowedPhone) continue;
        const names = new Map<string, string>((value.contacts || []).map((c: any) => [asString(c.wa_id), asString(c.profile?.name)]));
        for (const item of value.messages || []) {
          const participantId = asString(item.from);
          const providerMessageId = asString(item.id);
          if (!assetId || !participantId || !providerMessageId) continue;
          const text = this.messageText(item);
          await this.storeInbound(InboxChannel.WHATSAPP, assetId, participantId, names.get(participantId) || null, providerMessageId, text, dateFromSeconds(item.timestamp));
        }
      }
    }
  }

  private async receiveMessenger(payload: any) {
    const active = await this.meta.connection('MESSENGER');
    const allowedPage = active?.assetId || this.config.get<string>('MESSENGER_PAGE_ID');
    if (!allowedPage) return;
    for (const entry of payload.entry || []) {
      const pageId = asString(entry.id);
      if (pageId !== allowedPage) continue;
      for (const event of entry.messaging || []) {
        // Ignore delivery/read/postback/echo events: only customer-authored messages enter the inbox.
        if (!event.message || event.message.is_echo) continue;
        const participantId = asString(event.sender?.id);
        const providerMessageId = asString(event.message.mid);
        if (!pageId || !participantId || !providerMessageId) continue;
        const text = this.messageText(event.message);
        await this.storeInbound(InboxChannel.MESSENGER, pageId, participantId, null, providerMessageId, text, event.timestamp ? new Date(Number(event.timestamp)) : new Date());
      }
    }
  }

  private messageText(message: any): string {
    if (typeof message?.text === 'string' && message.text.trim()) return message.text.trim().slice(0, 4000);
    if (message?.interactive?.button_reply?.title) return `[Button] ${String(message.interactive.button_reply.title).slice(0, 3900)}`;
    if (message?.interactive?.list_reply?.title) return `[Selection] ${String(message.interactive.list_reply.title).slice(0, 3900)}`;
    if (message?.type) return `[${String(message.type).replace(/[^a-z_]/gi, '').slice(0, 40)} message]`;
    if (message?.attachments?.length) return '[Attachment received]';
    return '[Message received]';
  }

  private async storeInbound(channel: InboxChannel, assetId: string, participantId: string, name: string | null, providerMessageId: string, text: string, sentAt: Date) {
    try {
      await this.conversations.manager.transaction(async (manager) => {
        const conversationRepo = manager.getRepository(InboxConversation);
        const messageRepo = manager.getRepository(InboxMessage);
        if (await messageRepo.exist({ where: { providerMessageId } })) return;
        let conversation = await conversationRepo.findOne({ where: { channel, businessAssetId: assetId, participantId }, lock: { mode: 'pessimistic_write' } });
        if (!conversation) {
          conversation = conversationRepo.create({ channel, businessAssetId: assetId, participantId, participantName: name, unreadCount: 0, active: true });
        }
        if (name) conversation.participantName = name;
        conversation.lastMessagePreview = text.slice(0, 500);
        conversation.lastMessageAt = sentAt;
        conversation.lastInboundAt = sentAt;
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        conversation = await conversationRepo.save(conversation);
        await messageRepo.insert({ conversationId: conversation.id, channel, providerMessageId, text, fromBusiness: false, sentAt });
      });
    } catch (error: any) {
      // Concurrent webhook retries can race on either unique key. The transaction
      // rolls back the unread counter together with a duplicate message insert.
      if (error?.code === '23505') return;
      throw error;
    }
  }

  async listConversations() {
    await this.syncMessengerHistory().catch(() => undefined);
    return this.conversations.find({ where: { active: true }, order: { lastMessageAt: 'DESC', updatedAt: 'DESC' }, take: 200 });
  }

  async getMessages(conversationId: string) {
    const conversation = await this.conversations.findOne({ where: { id: conversationId, active: true } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    await this.conversations.update(conversationId, { unreadCount: 0 });
    return this.messages.find({ where: { conversationId }, order: { sentAt: 'ASC' }, take: 500 });
  }

  async sendReply(conversationId: string, rawText: string) {
    const text = rawText.trim();
    if (!text || text.length > 4000) throw new BadRequestException('Message must be between 1 and 4,000 characters');
    const conversation = await this.conversations.findOne({ where: { id: conversationId, active: true } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.channel === InboxChannel.GMAIL) return this.gmail.sendReply(conversation, text);
    const maxAgeMs = 24 * 60 * 60 * 1000;
    if (!conversation.lastInboundAt || Date.now() - conversation.lastInboundAt.getTime() > maxAgeMs) {
      throw new BadRequestException('The 24-hour customer reply window has closed. Use an approved WhatsApp template or wait for the customer to message again.');
    }
    const version = this.config.get<string>('META_GRAPH_API_VERSION', 'v27.0');
    const payload = conversation.channel === InboxChannel.WHATSAPP
      ? { messaging_product: 'whatsapp', recipient_type: 'individual', to: conversation.participantId, type: 'text', text: { body: text } }
      : { recipient: { id: conversation.participantId }, messaging_type: 'RESPONSE', message: { text } };
    const connection = await this.meta.connection(conversation.channel === InboxChannel.WHATSAPP ? 'WHATSAPP' : 'MESSENGER');
    const token = connection?.accessToken || (conversation.channel === InboxChannel.WHATSAPP
      ? this.settings.get('whatsappAccessToken', 'WHATSAPP_ACCESS_TOKEN')
      : this.settings.get('messengerPageAccessToken', 'MESSENGER_PAGE_ACCESS_TOKEN'));
    const assetId = connection?.assetId || (conversation.channel === InboxChannel.WHATSAPP
      ? this.settings.get('whatsappPhoneNumberId', 'WHATSAPP_PHONE_NUMBER_ID')
      : this.settings.get('messengerPageId', 'MESSENGER_PAGE_ID'));
    if (assetId !== conversation.businessAssetId) throw new BadRequestException('This conversation belongs to a different connected account.');
    if (!token || !assetId) throw new ServiceUnavailableException(`${conversation.channel} sending is not configured`);
    const endpoint = conversation.channel === InboxChannel.WHATSAPP ? `${assetId}/messages` : `${assetId}/messages`;
    let response: Response;
    try {
      response = await fetch(`https://graph.facebook.com/${version}/${endpoint}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ServiceUnavailableException('Could not reach Meta. Please try again.');
    }
    const result: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Do not return upstream response bodies: provider errors can contain sensitive request details.
      throw new BadRequestException('Meta could not send this message. Check channel permissions and reply-window rules.');
    }
    const providerMessageId = asString(result?.messages?.[0]?.id || result?.message_id) || `local-${conversation.channel.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sentAt = new Date();
    const message = await this.messages.save(this.messages.create({ conversationId, channel: conversation.channel, providerMessageId, text, fromBusiness: true, sentAt }));
    conversation.lastMessagePreview = text.slice(0, 500);
    conversation.lastMessageAt = sentAt;
    await this.conversations.save(conversation);
    return message;
  }
}
