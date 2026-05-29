import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('staff_promotion_stats')
export class StaffPromotionStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staff_id: string;

  @Column({ nullable: true })
  staff_name: string;

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  participate_count: number;

  @Column({ type: 'int', default: 0 })
  conversion_count: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_order_amount: number;

  @Column({ type: 'date', nullable: true })
  date: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
