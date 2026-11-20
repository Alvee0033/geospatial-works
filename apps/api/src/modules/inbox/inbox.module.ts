import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxConversation } from '../../entities/inbox-conversation.entity';
import { InboxMessage } from '../../entities/inbox-message.entity';
import { GmailInboxConnection } from '../../entities/gmail-connection.entity';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { GmailInboxService } from './gmail.service';

@Module({
  imports: [TypeOrmModule.forFeature([InboxConversation, InboxMessage, GmailInboxConnection])],
  controllers: [InboxController],
  providers: [InboxService, GmailInboxService],
})
export class InboxModule {}
