import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  contact_name: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({     type: 'datetime', nullable: true })
  expire_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  user_count: number;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
