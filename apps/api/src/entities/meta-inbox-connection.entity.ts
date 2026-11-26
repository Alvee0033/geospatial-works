import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('meta_inbox_connection')
export class MetaInboxConnection {
  @PrimaryColumn({ type: 'varchar', length: 16 }) channel: 'WHATSAPP' | 'MESSENGER';
  @Column({ type: 'varchar', length: 128 }) assetId: string;
  @Column({ type: 'varchar', length: 128, nullable: true }) parentAssetId: string | null;
  @Column({ type: 'varchar', length: 255 }) displayName: string;
  @Column({ type: 'text' }) encryptedAccessToken: string;
  @Column({ type: 'varchar', length: 32 }) iv: string;
  @Column({ type: 'varchar', length: 32 }) authTag: string;
  @Column({ type: 'timestamptz', nullable: true }) tokenExpiresAt: Date | null;
  @Column({ type: 'timestamptz' }) connectedAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
