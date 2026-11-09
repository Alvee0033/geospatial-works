import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface StructuredCv {
  summary?: string;
  degrees?: { degree: string; institution: string; year?: string }[];
  licensures?: string[];
  memberships?: string[];
  skills?: string[];
  software?: string[];
  projects?: { title: string; client?: string; role?: string; details?: string }[];
  awards?: string[];
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  category: string;

  @Column({ type: 'text', nullable: true })
  credentials: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  fullCvText: string;

  @Column({ type: 'jsonb', nullable: true })
  structuredCv: StructuredCv;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

