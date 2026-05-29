import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Campaign, CampaignType, CampaignStatus } from '../entities/campaign.entity';
import { Commission } from '../entities/commission.entity';
import { RedPacket } from '../entities/red-packet.entity';
import { Tenant } from '../entities/tenant.entity';
import { Customer } from '../entities/customer.entity';
import { DailyReport } from '../entities/daily-report.entity';
import { RebateRecord } from '../entities/rebate-record.entity';
import { StaffPromotionStats } from '../entities/staff-promotion-stats.entity';
import { BrowseLog } from '../entities/browse-log.entity';
import { Order } from '../entities/order.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { v4 as uuidv4 } from 'uuid';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'data/app.sqlite',
  entities: [User, Campaign, Commission, RedPacket, Tenant, Customer, DailyReport, RebateRecord, StaffPromotionStats, BrowseLog, Order, AuditLog],
  synchronize: true,
  logging: false,
});

async function seed() {
  const ds = await AppDataSource.initialize();
  const userRepo = ds.getRepository(User);
  const campaignRepo = ds.getRepository(Campaign);
  const tenantRepo = ds.getRepository(Tenant);

  const existing = await userRepo.findOne({ where: { username: 'admin' } });
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    await ds.destroy();
    return;
  }

  const hashedPwd = await bcrypt.hash('admin123', 10);

  const admin = userRepo.create({
    username: 'admin',
    password: hashedPwd,
    nickname: '管理员',
    phone: '13800000000',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  });
  await userRepo.save(admin);
  console.log('✅ Admin user created: admin / admin123');

  const tenant = tenantRepo.create({
    name: '优智创美容拓客',
    contact_name: '管理员',
    contact_phone: '13800000000',
    is_active: true,
  });
  await tenantRepo.save(tenant);
  console.log('✅ Tenant created: 优智创美容拓客');

  const campaigns = [
    { title: '618大促抽奖活动', description: '618购物节期间的用户抽奖活动', type: CampaignType.LOTTERY, status: CampaignStatus.ACTIVE, start_time: new Date('2026-06-01'), end_time: new Date('2026-06-20'), budget: 50000 },
    { title: '新用户注册红包', description: '针对新用户的注册奖励活动', type: CampaignType.RED_PACKET, status: CampaignStatus.ACTIVE, start_time: new Date('2026-05-01'), end_time: new Date('2026-12-31'), budget: 200000 },
    { title: '会员日专属活动', description: '每月会员日的专属福利', type: CampaignType.LOTTERY, status: CampaignStatus.ACTIVE, start_time: new Date('2026-06-15'), end_time: new Date('2026-06-16'), budget: 80000 },
    { title: '春节集卡活动', description: '春节期间的集卡兑奖活动', type: CampaignType.LOTTERY, status: CampaignStatus.ENDED, start_time: new Date('2026-01-20'), end_time: new Date('2026-02-10'), budget: 300000 },
    { title: '双11预热活动', description: '双11前的预热小游戏', type: CampaignType.LOTTERY, status: CampaignStatus.DRAFT, start_time: new Date('2026-10-20'), end_time: new Date('2026-11-11'), budget: 150000 },
  ];

  for (const c of campaigns) {
    await campaignRepo.save(campaignRepo.create({
      ...c,
      campaign_id: uuidv4(),
      merchant_id: admin.id,
      merchant_name: '管理员',
    }));
  }
  console.log(`✅ Created ${campaigns.length} campaigns`);

  await ds.destroy();
  console.log('Seed complete!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
