import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('browse_logs')
export class BrowseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  staff_id: string;

  @Column({ nullable: true })
  campaign_id: string;

  @Column({ nullable: true })
  campaign_title: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ default: 'view' })
  action: string;

  @CreateDateColumn()
  created_at: Date;
}
