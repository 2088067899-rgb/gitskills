import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  FROZEN = 'frozen',
}

export enum CampaignType {
  LOTTERY = 'lottery',
  RED_PACKET = 'red_packet',
  COUPON = 'coupon',
  GAME = 'game',
  TASK = 'task',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  campaign_id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({
    type: 'varchar',
    enum: CampaignType,
    default: CampaignType.LOTTERY
  })
  type: CampaignType;

  @Column({
    type: 'varchar',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT
  })
  status: CampaignStatus;

  @Column({ type: 'datetime' })
  start_time: Date;

  @Column({ type: 'datetime' })
  end_time: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'json', nullable: true })
  settings: {
    share_required: boolean;
    daily_limit: number;
    participation_limit: number;
    win_probability: number;
    rules: string;
  };

  @Column({ type: 'json', nullable: true })
  statistics: {
    views: number;
    participates: number;
    registrations: number;
    payments: number;
    offline: number;
  };

  @ManyToOne(() => User)
  merchant: User;

  @Column()
  merchant_id: string;

  @Column()
  merchant_name: string;

  @Column({ type: 'json', nullable: true })
  share_config: {
    title: string;
    description: string;
    image: string;
  };

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}
