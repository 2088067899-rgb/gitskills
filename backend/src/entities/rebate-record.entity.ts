import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RebateStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
}

@Entity('rebate_records')
export class RebateRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  order_id: string;

  @Column({ nullable: true })
  order_no: string;

  @Column({
    type: 'varchar',
    enum: RebateStatus,
    default: RebateStatus.PENDING
  })
  status: RebateStatus;

  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
