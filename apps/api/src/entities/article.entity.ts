import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  publishDate: string;

  @Column('text')
  summary: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

