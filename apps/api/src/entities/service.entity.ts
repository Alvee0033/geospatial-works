import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column('text')
  description: string;

  @Column('jsonb', { default: [] })
  features: string[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

