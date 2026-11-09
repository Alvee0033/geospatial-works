import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'PEOPLE • DATA • RESILIENT BANGLADESH' })
  eyebrow: string;

  @Column()
  heading: string;

  @Column('text')
  description: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  mediaType: 'image' | 'video';

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ default: 'Explore Our Services' })
  primaryActionText: string;

  @Column({ default: '/services' })
  primaryActionHref: string;

  @Column({ default: 'Get in Touch' })
  secondaryActionText: string;

  @Column({ default: '/contact' })
  secondaryActionHref: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

