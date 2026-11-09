import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { JobApplication } from './job-application.entity';

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  PERMANENT = 'Full-time / Permanent',
  INTERNSHIP = 'Internship',
}

export enum JobStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  CLOSED = 'closed',
}

@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  department: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  type: JobType;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  qualifications: string[];

  @Column('simple-array', { nullable: true })
  responsibilities: string[];

  @Column({ nullable: true })
  experienceLevel: string; // e.g., '3-5 years', 'Mid-Senior'

  @Column({ nullable: true })
  salaryRange: string; // e.g., 'Competitive / Negotiable'

  @Column({ nullable: true })
  deadline: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PUBLISHED,
  })
  status: JobStatus;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => JobApplication, (application) => application.jobPost, {
    cascade: true,
  })
  applications: JobApplication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
