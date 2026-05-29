import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { Campaign, CampaignType, CampaignStatus } from './entities/campaign.entity';
import { Tenant } from './entities/tenant.entity';

async function seedIfEmpty(ds: DataSource) {
  const userRepo = ds.getRepository(User);
  const count = await userRepo.count();
  if (count > 0) return;

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
  console.log('✅ Auto-seeded admin user');

  const tenant = ds.getRepository(Tenant).create({
    name: '优智创美容拓客',
    contact_name: '管理员',
    contact_phone: '13800000000',
    is_active: true,
  });
  await ds.getRepository(Tenant).save(tenant);
  console.log('✅ Auto-seeded tenant');

  const campaigns = [
    { title: '618大促抽奖活动', type: CampaignType.LOTTERY, status: CampaignStatus.ACTIVE, start_time: new Date('2026-06-01'), end_time: new Date('2026-06-20'), budget: 50000 },
    { title: '新用户注册红包', type: CampaignType.RED_PACKET, status: CampaignStatus.ACTIVE, start_time: new Date('2026-05-01'), end_time: new Date('2026-12-31'), budget: 200000 },
    { title: '会员日专属活动', type: CampaignType.LOTTERY, status: CampaignStatus.ACTIVE, start_time: new Date('2026-06-15'), end_time: new Date('2026-06-16'), budget: 80000 },
  ];
  for (const c of campaigns) {
    await ds.getRepository(Campaign).save(ds.getRepository(Campaign).create({
      ...c,
      description: c.title,
      campaign_id: `CAMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      merchant_id: admin.id,
      merchant_name: '管理员',
    }));
  }
  console.log('✅ Auto-seeded 3 campaigns');
}

async function bootstrap() {
  const dataDir = path.resolve(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  try {
    const ds = app.get(DataSource);
    await seedIfEmpty(ds);
  } catch (e) {
    console.log('Seed check skipped:', (e as Error).message);
  }

  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
