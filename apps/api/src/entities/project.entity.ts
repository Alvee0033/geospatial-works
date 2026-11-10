import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  client: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  location: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  deliverables: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, unknown>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isMilestone: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

