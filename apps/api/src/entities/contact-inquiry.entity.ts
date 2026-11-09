import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

@Entity('contact_inquiries')
export class ContactInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  serviceType: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.NEW,
  })
  status: InquiryStatus;

  @Column('text', { nullable: true })
  internalNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

