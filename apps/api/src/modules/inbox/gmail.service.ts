import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { GmailInboxConnection } from '../../entities/gmail-connection.entity';
import { InboxChannel, InboxConversation } from '../../entities/inbox-conversation.entity';
import { InboxMessage } from '../../entities/inbox-message.entity';

const text = (value: unknown) => typeof value === 'string' ? value : '';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const GMAIL_SCOPE = ['openid', 'email', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];

@Injectable()
export class GmailInboxService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(GmailInboxService.name);
  private timer?: NodeJS.Timeout;
  private syncing = false;

  constructor(
    @InjectRepository(GmailInboxConnection) private readonly connections: Repository<GmailInboxConnection>,
    @InjectRepository(InboxConversation) private readonly conversations: Repository<InboxConversation>,
    @InjectRepository(InboxMessage) private readonly messages: Repository<InboxMessage>,
    private readonly config: ConfigService,
  ) {}

  private configured() {
    return Boolean(this.config.get('GOOGLE_CLIENT_ID') && this.config.get('GOOGLE_CLIENT_SECRET') && this.config.get('GOOGLE_REDIRECT_URI') && this.config.get('GOOGLE_OAUTH_STATE_SECRET') && this.encryptionKey());
  }

  async status() {
    const connection = await this.connections.findOne({ where: { id: 'primary' } });
    return { configured: this.configured(), connected: Boolean(connection), email: connection?.email || null };
  }

  startAuthorization(adminId: string) {
    if (!this.configured()) throw new ServiceUnavailableException('Gmail OAuth is not configured on the API server');
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')!;
    const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI')!;
    const secret = this.config.get<string>('GOOGLE_OAUTH_STATE_SECRET')!;
    const payload = Buffer.from(JSON.stringify({ adminId, issuedAt: Date.now(), nonce: randomBytes(18).toString('base64url') })).toString('base64url');
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');
    const state = `${payload}.${signature}`;
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', GMAIL_SCOPE.join(' '));
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('state', state);
    return { authorizationUrl: url.toString() };
  }

  private validateState(state: string) {
    const [payload, signature] = state.split('.');
    const secret = this.config.get<string>('GOOGLE_OAUTH_STATE_SECRET');
    if (!payload || !signature || !secret) throw new UnauthorizedException('Invalid Google authorization state');
    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
    const a = Buffer.from(expected); const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid Google authorization state');
    let data: any;
    try { data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { throw new UnauthorizedException('Invalid Google authorization state'); }
    if (!data?.adminId || Date.now() - Number(data.issuedAt) > 10 * 60 * 1000 || Number(data.issuedAt) > Date.now() + 60_000) throw new UnauthorizedException('Google authorization state expired');
    return data;
  }

  async finishAuthorization(code: string, state: string): Promise<string> {
    this.validateState(state);
    if (!this.configured()) throw new ServiceUnavailableException('Gmail OAuth is not configured on the API server');
    const tokens = await this.exchangeCode(code);
    if (!tokens.refresh_token) throw new ServiceUnavailableException('Google did not issue a refresh token. Reconnect and approve offline access.');
    const user = await this.googleFetch('https://www.googleapis.com/oauth2/v2/userinfo', tokens.access_token);
    if (!user?.email) throw new ServiceUnavailableException('Could not read the authorized Gmail address');
    const profile = await this.gmailFetch('/profile', tokens.access_token);
    const encrypted = this.encrypt(tokens.refresh_token);
    const connection = this.connections.create({ id: 'primary', email: user.email, encryptedRefreshToken: encrypted.ciphertext, iv: encrypted.iv, authTag: encrypted.authTag, historyId: String(profile.historyId || ''), connectedAt: new Date() });
    await this.connections.save(connection);
    void this.syncMailbox(true).catch(() => undefined);
    const base = this.config.get<string>('ADMIN_PUBLIC_URL', 'http://localhost:3012');
    return `${base.replace(/\/$/, '')}/?tab=inbox&gmail=connected`;
  }

  private encryptionKey(): Buffer | null {
    const value = this.config.get<string>('GMAIL_TOKEN_ENCRYPTION_KEY') || '';
    if (!/^[a-fA-F0-9]{64}$/.test(value)) return null;
    return Buffer.from(value, 'hex');
  }

  private encrypt(value: string) {
    const key = this.encryptionKey();
    if (!key) throw new ServiceUnavailableException('GMAIL_TOKEN_ENCRYPTION_KEY must be a 32-byte hex key');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('hex'), authTag: cipher.getAuthTag().toString('hex') };
  }

  private decrypt(connection: GmailInboxConnection) {
    const key = this.encryptionKey();
    if (!key) throw new ServiceUnavailableException('Gmail token encryption is not configured');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(connection.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(connection.authTag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(connection.encryptedRefreshToken, 'base64')), decipher.final()]).toString('utf8');
  }

  private async exchangeCode(code: string) {
    const body = new URLSearchParams({ code, client_id: this.config.get<string>('GOOGLE_CLIENT_ID')!, client_secret: this.config.get<string>('GOOGLE_CLIENT_SECRET')!, redirect_uri: this.config.get<string>('GOOGLE_REDIRECT_URI')!, grant_type: 'authorization_code' });
    const response = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(15000) });
    const result: any = await response.json().catch(() => ({}));
    if (!response.ok || !result.access_token) throw new ServiceUnavailableException('Google authorization could not be completed. Check the OAuth client and callback URL.');
    return result;
  }

  private async accessToken(connection: GmailInboxConnection) {
    const refreshToken = this.decrypt(connection);
    const body = new URLSearchParams({ client_id: this.config.get<string>('GOOGLE_CLIENT_ID') || '', client_secret: this.config.get<string>('GOOGLE_CLIENT_SECRET') || '', refresh_token: refreshToken, grant_type: 'refresh_token' });
    const response = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(15000) });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new ServiceUnavailableException('Google access expired or was revoked. Reconnect Gmail in the inbox settings.');
    return data.access_token as string;
  }

  private async googleFetch(url: string, accessToken: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers || {}) }, signal: AbortSignal.timeout(15000) });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new ServiceUnavailableException(`Google API request failed (${response.status}).`);
    return data;
  }

  private gmailFetch(path: string, accessToken: string, init?: RequestInit) { return this.googleFetch(`${GMAIL_API}${path}`, accessToken, init); }

  private parseAddress(raw: string) {
    const match = raw.match(/^(.*?)\s*<([^<>]+)>$/);
    return match ? { email: match[2].trim().toLowerCase(), name: match[1].replace(/^"|"$/g, '').trim() } : { email: raw.trim().toLowerCase(), name: '' };
  }

  private headers(payload: any) {
    return new Map<string, string>((payload?.headers || []).map((item: any) => [String(item.name || '').toLowerCase(), String(item.value || '')]));
  }

  private decodeBody(encoded?: string) {
    if (!encoded) return '';
    return Buffer.from(encoded, 'base64url').toString('utf8');
  }

  private bodyFromPayload(payload: any): string {
    if (!payload) return '';
    if (payload.mimeType === 'text/plain' && payload.body?.data) return this.decodeBody(payload.body.data);
    for (const part of payload.parts || []) {
      const found = this.bodyFromPayload(part);
      if (found) return found;
    }
    if (payload.mimeType === 'text/html' && payload.body?.data) return this.decodeBody(payload.body.data).replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    return '';
  }

  private async importMessage(id: string, accessToken: string) {
    if (await this.messages.exist({ where: { providerMessageId: id } })) return;
    const mail = await this.gmailFetch(`/messages/${encodeURIComponent(id)}?format=full`, accessToken);
    if (!(mail.labelIds || []).includes('INBOX')) return;
    const headers = this.headers(mail.payload);
    const parsed = this.parseAddress(headers.get('from') || 'unknown');
    if (!parsed.email) return;
    const subject = (headers.get('subject') || '(no subject)').replace(/[\r\n]/g, ' ').slice(0, 500);
    const body = this.bodyFromPayload(mail.payload) || mail.snippet || '[Email received]';
    const sentAt = new Date(Number(mail.internalDate) || Date.now());
    await this.conversations.manager.transaction(async manager => {
      const convRepo = manager.getRepository(InboxConversation);
      const msgRepo = manager.getRepository(InboxMessage);
      if (await msgRepo.exist({ where: { providerMessageId: id } })) return;
      const threadId = text(mail.threadId);
      const businessAssetId = `${this.config.get<string>('GOOGLE_CLIENT_ID') || 'gmail'}:${threadId}`;
      let conversation = await convRepo.findOne({ where: { channel: InboxChannel.GMAIL, businessAssetId, participantId: parsed.email }, lock: { mode: 'pessimistic_write' } });
      if (!conversation) conversation = convRepo.create({ channel: InboxChannel.GMAIL, businessAssetId, participantId: parsed.email, unreadCount: 0, active: true });
      conversation.participantName = parsed.name || parsed.email;
      conversation.replyAddress = parsed.email;
      conversation.emailThreadId = threadId;
      conversation.emailSubject = subject;
      conversation.lastEmailMessageId = headers.get('message-id') || null;
      conversation.lastMessagePreview = body.slice(0, 500);
      conversation.lastMessageAt = sentAt;
      conversation.lastInboundAt = sentAt;
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      conversation = await convRepo.save(conversation);
      await msgRepo.insert({ conversationId: conversation.id, channel: InboxChannel.GMAIL, providerMessageId: id, text: `${subject}\n\n${body}`.slice(0, 16000), fromBusiness: false, sentAt });
    });
  }

  async syncMailbox(initial = false) {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const connection = await this.connections.findOne({ where: { id: 'primary' } });
      if (!connection) return;
      const token = await this.accessToken(connection);
      if (!connection.historyId || initial) {
        const list = await this.gmailFetch('/messages?labelIds=INBOX&maxResults=50&q=newer_than%3A7d', token);
        for (const message of list.messages || []) await this.importMessage(text(message.id), token);
        const profile = await this.gmailFetch('/profile', token);
        connection.historyId = String(profile.historyId || connection.historyId || '');
        await this.connections.save(connection);
        return;
      }
      let pageToken = '';
      let newestHistory = connection.historyId;
      do {
        const query = new URLSearchParams({ startHistoryId: connection.historyId, historyTypes: 'messageAdded', maxResults: '100' });
        if (pageToken) query.set('pageToken', pageToken);
        const result = await this.gmailFetch(`/history?${query.toString()}`, token);
        for (const record of result.history || []) {
          newestHistory = String(record.id || newestHistory);
          for (const item of record.messagesAdded || []) await this.importMessage(text(item.message?.id), token);
        }
        pageToken = text(result.nextPageToken);
      } while (pageToken);
      if (newestHistory !== connection.historyId) {
        const profile = await this.gmailFetch('/profile', token);
        connection.historyId = String(profile.historyId || newestHistory);
        await this.connections.save(connection);
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException && error.message.includes('(404)')) {
        const connection = await this.connections.findOne({ where: { id: 'primary' } });
        if (connection) { connection.historyId = null; await this.connections.save(connection); }
      }
      this.logger.warn(`Gmail inbox sync skipped: ${error instanceof Error ? error.message : 'Google API error'}`);
    } finally { this.syncing = false; }
  }

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.syncMailbox(), 60_000);
    this.timer.unref?.();
    void this.syncMailbox();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async sendReply(conversation: InboxConversation, content: string) {
    if (!conversation.replyAddress) throw new ServiceUnavailableException('This email conversation has no reply address');
    const connection = await this.connections.findOne({ where: { id: 'primary' } });
    if (!connection) throw new ServiceUnavailableException('Gmail is not connected');
    const token = await this.accessToken(connection);
    const subjectText = conversation.emailSubject || '(no subject)';
    const subject = /^(re|fw|fwd):/i.test(subjectText) ? subjectText : `Re: ${subjectText}`;
    const encodeSubject = /[^\x20-\x7e]/.test(subject) ? `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=` : subject.replace(/[\r\n]/g, ' ');
    const headers = [`To: ${conversation.replyAddress}`, `Subject: ${encodeSubject}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: base64'];
    if (conversation.lastEmailMessageId) {
      const originalId = conversation.lastEmailMessageId.replace(/[\r\n]/g, '');
      headers.splice(2, 0, `In-Reply-To: ${originalId}`, `References: ${originalId}`);
    }
    const raw = Buffer.from(`${headers.join('\r\n')}\r\n\r\n${Buffer.from(content, 'utf8').toString('base64')}`, 'utf8').toString('base64url');
    const data = await this.gmailFetch('/messages/send', token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raw, threadId: conversation.emailThreadId }) });
    const sentAt = new Date();
    const message = await this.messages.save(this.messages.create({ conversationId: conversation.id, channel: InboxChannel.GMAIL, providerMessageId: text(data.id) || `gmail-local-${Date.now()}`, text: content, fromBusiness: true, sentAt }));
    conversation.lastMessagePreview = content.slice(0, 500);
    conversation.lastMessageAt = sentAt;
    conversation.emailThreadId = text(data.threadId) || conversation.emailThreadId;
    await this.conversations.save(conversation);
    return message;
  }
}
