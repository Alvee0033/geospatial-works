import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobPost } from './job-post.entity';

export enum ApplicationStatus {
  NEW = 'new',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEWED = 'interviewed',
  REJECTED = 'rejected',
  HIRED = 'hired',
}

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  jobPostId: string;

  @ManyToOne(() => JobPost, (job) => job.applications, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'jobPostId' })
  jobPost: JobPost;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  linkedInUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column({ nullable: true })
  currentCompany: string;

  @Column({ nullable: true })
  currentTitle: string;

  @Column({ nullable: true })
  yearsOfExperience: string;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.NEW,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
