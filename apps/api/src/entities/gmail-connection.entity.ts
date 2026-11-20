import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('gmail_inbox_connection')
export class GmailInboxConnection {
  @PrimaryColumn({ type: 'varchar', length: 16 }) id: string;
  @Column({ type: 'varchar', length: 320 }) email: string;
  @Column({ type: 'text' }) encryptedRefreshToken: string;
  @Column({ type: 'varchar', length: 32 }) iv: string;
  @Column({ type: 'varchar', length: 32 }) authTag: string;
  @Column({ type: 'varchar', length: 200, nullable: true }) historyId: string | null;
  @Column({ type: 'timestamptz' }) connectedAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
