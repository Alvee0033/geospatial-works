import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('page_sections')
@Unique(['pageKey', 'sectionKey'])
export class PageSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pageKey: string; // e.g. 'home', 'about', 'services'

  @Column()
  sectionKey: string; // e.g. 'about_summary', 'services_intro'

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column('jsonb', { default: {} })
  content: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

