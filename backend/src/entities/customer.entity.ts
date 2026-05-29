import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  wechat: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  staff_id: string;

  @Column({ nullable: true })
  staff_name: string;

  @Column({ nullable: true })
  campaign_id: string;

  @Column({ nullable: true })
  campaign_title: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'int', default: 0 })
  visit_count: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
