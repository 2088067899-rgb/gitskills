import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Campaign } from './campaign.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING
  })
  status: CommissionStatus;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({     type: 'datetime', nullable: true })
  paid_at: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User)
  user: User;

  @Column()
  user_id: string;

  @Column()
  username: string;

  @ManyToOne(() => Campaign)
  campaign: Campaign;

  @Column()
  campaign_id: number;

  @Column()
  campaign_title: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
