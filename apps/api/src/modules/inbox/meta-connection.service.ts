import { BadRequestException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { MetaInboxConnection } from '../../entities/meta-inbox-connection.entity';

type MetaChannel = 'WHATSAPP' | 'MESSENGER';
type PendingPage = { id: string; name: string; access_token: string };
type PendingSelection = { adminId: string; expiresAt: number; pages: PendingPage[] };

@Injectable()
export class MetaConnectionService {
  constructor(
    @InjectRepository(MetaInboxConnection) private readonly connections: Repository<MetaInboxConnection>,
    private readonly config: ConfigService,
  ) {}

  private version() { return this.config.get<string>('META_GRAPH_API_VERSION', 'v27.0'); }

  private key(): Buffer | null {
    const value = this.config.get<string>('META_TOKEN_ENCRYPTION_KEY') || '';
    return /^[a-fA-F0-9]{64}$/.test(value) ? Buffer.from(value, 'hex') : null;
  }

  private encrypt(value: string) {
    const key = this.key();
    if (!key) throw new ServiceUnavailableException('Meta token storage is not configured');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return { encryptedAccessToken: encrypted.toString('base64'), iv: iv.toString('hex'), authTag: cipher.getAuthTag().toString('hex') };
  }

  private decrypt(connection: Pick<MetaInboxConnection, 'encryptedAccessToken' | 'iv' | 'authTag'>): string {
    const key = this.key();
    if (!key) throw new ServiceUnavailableException('Meta token storage is not configured');
    try {
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(connection.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(connection.authTag, 'hex'));
      return Buffer.concat([decipher.update(Buffer.from(connection.encryptedAccessToken, 'base64')), decipher.final()]).toString('utf8');
    } catch {
      throw new UnauthorizedException('Connection details are invalid or expired');
    }
  }

  setup() {
    const appId = this.config.get<string>('META_APP_ID') || '';
    const secret = this.config.get<string>('META_APP_SECRET') || '';
    const storageReady = Boolean(this.key());
    const webhookReady = Boolean(this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN') ||
      (this.config.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN') && this.config.get<string>('MESSENGER_WEBHOOK_VERIFY_TOKEN')));
    return {
      appId: appId && secret && storageReady ? appId : null,
      whatsappConfigId: appId && secret && storageReady && webhookReady ? this.config.get<string>('META_WHATSAPP_CONFIG_ID') || null : null,
      messengerConfigId: appId && secret && storageReady && webhookReady ? this.config.get<string>('META_MESSENGER_CONFIG_ID') || null : null,
      webhookReady,
    };
  }

  async status(channel: MetaChannel) {
    const connection = await this.connections.findOne({ where: { channel } });
    const ready = this.setup();
    return {
      configured: Boolean(channel === 'WHATSAPP' ? ready.whatsappConfigId : ready.messengerConfigId),
      connected: Boolean(connection),
      displayName: connection?.displayName || null,
      assetId: connection?.assetId || null,
      connectedAt: connection?.connectedAt || null,
      tokenExpiresAt: connection?.tokenExpiresAt || null,
    };
  }

  async connection(channel: MetaChannel) {
    const record = await this.connections.findOne({ where: { channel } });
    if (!record) return null;
    return { assetId: record.assetId, parentAssetId: record.parentAssetId, accessToken: this.decrypt(record) };
  }

  private async graph(path: string, accessToken: string, init?: RequestInit) {
    let response: Response;
    try {
      response = await fetch(`https://graph.facebook.com/${this.version()}/${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers || {}) },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ServiceUnavailableException('Could not reach Meta. Please try again.');
    }
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new BadRequestException(`Meta could not complete the connection (${response.status}). Check the app permissions and business asset access.`);
    return data;
  }

  private async exchangeCode(code: string) {
    if (!code || code.length > 2000) throw new BadRequestException('Missing Meta authorization code');
    const appId = this.config.get<string>('META_APP_ID');
    const secret = this.config.get<string>('META_APP_SECRET');
    if (!appId || !secret || !this.key()) throw new ServiceUnavailableException('Meta connection is not configured');
    const body = new URLSearchParams({ client_id: appId, client_secret: secret, code });
    let response: Response;
    try {
      response = await fetch(`https://graph.facebook.com/${this.version()}/oauth/access_token`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ServiceUnavailableException('Could not reach Meta. Please try again.');
    }
    const result: any = await response.json().catch(() => ({}));
    if (!response.ok || !result.access_token) throw new BadRequestException('Meta authorization failed. Try connecting again.');
    return { token: String(result.access_token), expiresAt: result.expires_in ? new Date(Date.now() + Number(result.expires_in) * 1000) : null };
  }

  async beginMessenger(code: string, adminId: string) {
    if (!this.setup().messengerConfigId) throw new ServiceUnavailableException('Messenger setup is incomplete');
    const { token, expiresAt } = await this.exchangeCode(code);
    const result = await this.graph('me/accounts?fields=id,name,access_token,tasks&limit=100', token);
    const pages: PendingPage[] = (result.data || []).filter((page: any) =>
      typeof page.id === 'string' && typeof page.name === 'string' && typeof page.access_token === 'string' &&
      (!Array.isArray(page.tasks) || page.tasks.includes('MESSAGING'))
    );
    if (!pages.length) throw new BadRequestException('No Facebook Page with messaging access was found for this account.');
    const pending: PendingSelection = { adminId, expiresAt: Date.now() + 5 * 60_000, pages };
    const sealed = this.encrypt(JSON.stringify(pending));
    return {
      pages: pages.map(({ id, name }) => ({ id, name })),
      selectionToken: [sealed.iv, sealed.authTag, sealed.encryptedAccessToken].join('.'),
      tokenExpiresAt: expiresAt,
    };
  }

  async selectMessenger(selectionToken: string, pageId: string, adminId: string) {
    if (!selectionToken || selectionToken.length > 20000 || !/^[0-9]+$/.test(pageId)) throw new BadRequestException('Invalid Page selection');
    const [iv, authTag, encryptedAccessToken] = selectionToken.split('.');
    if (!iv || !authTag || !encryptedAccessToken) throw new BadRequestException('Page selection expired. Connect again.');
    let pending: PendingSelection;
    try { pending = JSON.parse(this.decrypt({ iv, authTag, encryptedAccessToken })); }
    catch { throw new BadRequestException('Page selection expired. Connect again.'); }
    if (pending.adminId !== adminId || pending.expiresAt < Date.now()) throw new UnauthorizedException('Page selection expired. Connect again.');
    const page = pending.pages.find((item) => item.id === pageId);
    if (!page) throw new BadRequestException('This Page was not granted by Meta.');
    await this.graph(`${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks`, page.access_token, { method: 'POST' });
    const encrypted = this.encrypt(page.access_token);
    await this.connections.save(this.connections.create({ channel: 'MESSENGER', assetId: pageId, parentAssetId: null,
      displayName: page.name, ...encrypted, tokenExpiresAt: null, connectedAt: new Date() }));
    return this.status('MESSENGER');
  }

  async connectWhatsApp(code: string, wabaId: string, phoneNumberId?: string, pin?: string, isOnBizApp = false) {
    if (!this.setup().whatsappConfigId) throw new ServiceUnavailableException('WhatsApp setup is incomplete');
    if (!/^[0-9]+$/.test(wabaId) || (phoneNumberId && !/^[0-9]+$/.test(phoneNumberId))) throw new BadRequestException('Meta did not return a valid WhatsApp account. Complete signup and try again.');
    if (pin && !/^[0-9]{6}$/.test(pin)) throw new BadRequestException('The two-step PIN must contain six digits');
    const { token, expiresAt } = await this.exchangeCode(code);
    const phones = await this.graph(`${wabaId}/phone_numbers?fields=id,display_phone_number&limit=100`, token);
    const phone = phoneNumberId ? (phones.data || []).find((item: any) => item.id === phoneNumberId) :
      (phones.data?.length === 1 ? phones.data[0] : null);
    if (!phone) throw new BadRequestException('The selected phone number does not belong to the authorized WhatsApp account.');
    phoneNumberId = String(phone.id);
    await this.graph(`${wabaId}/subscribed_apps`, token, { method: 'POST' });
    if (pin && !isOnBizApp) {
      await this.graph(`${phoneNumberId}/register`, token, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', pin }) });
    }
    const encrypted = this.encrypt(token);
    await this.connections.save(this.connections.create({ channel: 'WHATSAPP', assetId: phoneNumberId, parentAssetId: wabaId,
      displayName: String(phone.display_phone_number || phoneNumberId), ...encrypted, tokenExpiresAt: expiresAt, connectedAt: new Date() }));
    return { ...(await this.status('WHATSAPP')), registrationRequested: Boolean(pin && !isOnBizApp) };
  }

  async disconnect(channel: MetaChannel) {
    const connection = await this.connections.findOne({ where: { channel } });
    if (!connection) return;
    // Stop using the token immediately. Removing the subscription is best effort;
    // provider-side revocation is also available in Meta Business Settings.
    try {
      const asset = connection.parentAssetId || connection.assetId;
      await this.graph(`${asset}/subscribed_apps`, this.decrypt(connection), { method: 'DELETE' });
    } catch { /* Connection may already be revoked by Meta. */ }
    await this.connections.delete({ channel });
  }
}
