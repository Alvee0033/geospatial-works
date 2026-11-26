import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { PageSection } from '../../entities/page-section.entity';

export interface InboxChannelSettings {
  metaAppId?: string;
  metaAppSecret?: string;
  metaWebhookVerifyToken?: string;
  whatsappAccessToken?: string;
  whatsappPhoneNumberId?: string;
  messengerPageAccessToken?: string;
  messengerPageId?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri?: string;
  googleOauthStateSecret?: string;
  tokenEncryptionKey?: string;
}

@Injectable()
export class InboxSettingsService implements OnModuleInit {
  private cache: InboxChannelSettings = {};

  constructor(
    @InjectRepository(PageSection) private readonly sections: Repository<PageSection>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.reload();
  }

  async reload(): Promise<InboxChannelSettings> {
    const row = await this.sections.findOne({ where: { pageKey: 'inbox_config', sectionKey: 'channels' } }).catch(() => null);
    this.cache = (row?.content as InboxChannelSettings) || {};
    return this.cache;
  }

  get(key: keyof InboxChannelSettings, envKey?: string, fallback = ''): string {
    const fromDb = this.cache[key];
    if (typeof fromDb === 'string' && fromDb.trim()) return fromDb.trim();
    if (envKey) {
      const fromEnv = this.config.get<string>(envKey);
      if (fromEnv && fromEnv.trim()) return fromEnv.trim();
    }
    return fallback;
  }

  async save(patch: Partial<InboxChannelSettings>): Promise<InboxChannelSettings> {
    const existing = await this.sections.findOne({ where: { pageKey: 'inbox_config', sectionKey: 'channels' } });
    const current = ((existing?.content as InboxChannelSettings) || {});
    const merged: InboxChannelSettings = { ...current };
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === 'string') {
        merged[k as keyof InboxChannelSettings] = v.trim();
      }
    }
    if (!merged.tokenEncryptionKey && !this.config.get<string>('GMAIL_TOKEN_ENCRYPTION_KEY')) {
      merged.tokenEncryptionKey = randomBytes(32).toString('hex');
    }
    if (!merged.googleOauthStateSecret && !this.config.get<string>('GOOGLE_OAUTH_STATE_SECRET')) {
      merged.googleOauthStateSecret = randomBytes(24).toString('hex');
    }
    if (!merged.metaWebhookVerifyToken && !this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN')) {
      merged.metaWebhookVerifyToken = 'gw_verify_' + randomBytes(8).toString('hex');
    }

    if (existing) {
      existing.content = merged;
      await this.sections.save(existing);
    } else {
      await this.sections.save(
        this.sections.create({
          pageKey: 'inbox_config',
          sectionKey: 'channels',
          title: 'Inbox Channel Credentials',
          content: merged,
        }),
      );
    }
    this.cache = merged;
    return merged;
  }
}
