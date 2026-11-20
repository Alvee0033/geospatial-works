import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('client_contacts')
export class ClientContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  normalizedName: string;

  @Column({ length: 160 })
  clientName: string;

  /** Digits-only international format used by the official wa.me link. */
  @Column({ type: 'varchar', nullable: true, length: 15 })
  whatsappPhone: string | null;

  /** A client's own Messenger chat link (m.me), when they provide one. */
  @Column({ type: 'varchar', nullable: true, length: 500 })
  messengerUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
