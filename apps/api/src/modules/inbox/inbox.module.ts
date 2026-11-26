import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxConversation } from '../../entities/inbox-conversation.entity';
import { InboxMessage } from '../../entities/inbox-message.entity';
import { GmailInboxConnection } from '../../entities/gmail-connection.entity';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { GmailInboxService } from './gmail.service';
import { MetaInboxConnection } from '../../entities/meta-inbox-connection.entity';
import { MetaConnectionService } from './meta-connection.service';
import { PageSection } from '../../entities/page-section.entity';
import { InboxSettingsService } from './inbox-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([InboxConversation, InboxMessage, GmailInboxConnection, MetaInboxConnection, PageSection])],
  controllers: [InboxController],
  providers: [InboxService, GmailInboxService, MetaConnectionService, InboxSettingsService],
})
export class InboxModule {}
