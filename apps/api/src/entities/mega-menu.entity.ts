import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface MegaMenuItem {
  label: string;
  href: string;
  hasArrow?: boolean;
}

@Entity('mega_menus')
export class MegaMenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  menuKey: string; // e.g. 'who-we-are', 'what-we-do', 'insights', 'careers', 'projects', 'news', 'innovators'

  @Column({ type: 'text' })
  leadHeading: string;

  @Column({ type: 'text', nullable: true })
  leadSubtext: string;

  @Column({ nullable: true })
  leadLinkText: string;

  @Column({ nullable: true })
  leadLinkHref: string;

  @Column()
  categoryTitle: string;

  @Column({ type: 'jsonb' })
  items: MegaMenuItem[];

  @Column({ nullable: true })
  featuredLabel: string;

  @Column({ nullable: true })
  featuredTitle: string;

  @Column({ type: 'text', nullable: true })
  featuredDesc: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ nullable: true })
  featuredHref: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

