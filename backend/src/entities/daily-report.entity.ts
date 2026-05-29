import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('daily_reports')
export class DailyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'int', default: 0 })
  new_customers: number;

  @Column({ type: 'int', default: 0 })
  visits: number;

  @Column({ type: 'int', default: 0 })
  orders: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  order_amount: number;

  @Column({ type: 'int', default: 0 })
  shares: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'json', nullable: true })
  extra: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
