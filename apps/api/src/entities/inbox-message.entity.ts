import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { InboxChannel } from './inbox-conversation.entity';

@Entity('inbox_messages')
@Index('IDX_inbox_message_provider_id', ['providerMessageId'], { unique: true })
@Index('IDX_inbox_message_conversation_date', ['conversationId', 'sentAt'])
export class InboxMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') conversationId: string;
  @Column({ type: 'enum', enum: InboxChannel }) channel: InboxChannel;
  @Column({ length: 200, unique: true }) providerMessageId: string;
  @Column({ type: 'text' }) text: string;
  @Column({ type: 'boolean', default: false }) fromBusiness: boolean;
  @Column({ type: 'timestamptz' }) sentAt: Date;
  @CreateDateColumn() receivedAt: Date;
}
