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

@Module({
  imports: [TypeOrmModule.forFeature([InboxConversation, InboxMessage, GmailInboxConnection, MetaInboxConnection])],
  controllers: [InboxController],
  providers: [InboxService, GmailInboxService, MetaConnectionService],
})
export class InboxModule {}
