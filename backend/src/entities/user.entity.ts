import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MERCHANT = 'merchant',
  OPERATOR = 'operator',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ 
    type: 'varchar',
    enum: UserRole,
    default: UserRole.OPERATOR
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ nullable: true })
  merchant_id: string;

  @Column({ nullable: true })
  merchant_name: string;

  @Column({ nullable: true })
  tenant_id: string;

  @Column({ nullable: true })
  store_id: string;

  @Column({ nullable: true })
  invite_code: string;

  @Column({ nullable: true })
  wechat_openid: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  rebate_balance: number;

  @Column({ type: 'json', nullable: true })
  settings: {
    theme: string;
    notification: boolean;
    language: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  last_login_at: Date;
}
