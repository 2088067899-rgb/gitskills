import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum RedPacketStatus {
  AVAILABLE = 'available',
  USED = 'used',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum RedPacketType {
  RANDOM = 'random',
  FIXED = 'fixed',
  GROUP = 'group',
}

@Entity('red_packets')
export class RedPacket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  packet_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  max_amount: number;

  @Column({
    type: 'varchar',
    enum: RedPacketType,
    default: RedPacketType.FIXED
  })
  type: RedPacketType;

  @Column({
    type: 'varchar',
    enum: RedPacketStatus,
    default: RedPacketStatus.AVAILABLE
  })
  status: RedPacketStatus;

  @Column({ type: 'datetime' })
  expire_at: Date;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  sender_id: string;

  @Column()
  sender_name: string;

  @ManyToOne(() => User, { nullable: true })
  receiver: User;

  @Column({ nullable: true })
  receiver_id: string;

  @Column({ nullable: true })
  receiver_name: string;

  @Column({ type: 'datetime', nullable: true })
  received_at: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
