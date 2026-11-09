import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string; // 'DRONE FLEET', 'TOTAL STATION', 'LEVEL MACHINE', 'HYDROGRAPHIC', 'WORKSTATION'

  @Column()
  name: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  quantity: string;

  @Column('jsonb', { default: {} })
  specs: Record<string, any>;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

