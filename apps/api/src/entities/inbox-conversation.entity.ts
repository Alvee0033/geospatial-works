import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum InboxChannel { WHATSAPP = 'WHATSAPP', MESSENGER = 'MESSENGER', GMAIL = 'GMAIL' }

@Entity('inbox_conversations')
@Index('IDX_inbox_conversation_external', ['channel', 'businessAssetId', 'participantId'], { unique: true })
export class InboxConversation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: InboxChannel }) channel: InboxChannel;
  @Column({ length: 160 }) businessAssetId: string;
  @Column({ length: 200 }) participantId: string;
  @Column({ type: 'varchar', length: 200, nullable: true }) participantName: string | null;
  @Column({ type: 'varchar', length: 320, nullable: true }) replyAddress: string | null;
  @Column({ type: 'varchar', length: 200, nullable: true }) emailThreadId: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) emailSubject: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) lastEmailMessageId: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) lastMessagePreview: string | null;
  @Column({ type: 'timestamptz', nullable: true }) lastMessageAt: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) lastInboundAt: Date | null;
  @Column({ type: 'integer', default: 0 }) unreadCount: number;
  @Column({ type: 'boolean', default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
