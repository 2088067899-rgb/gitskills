import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'zqc@4788#$',
  database: 'marketing_system',
  entities: [__dirname + '/../entities/*.entity.{js,ts}']
});

interface CampaignData {
  title: string;
  description: string;
  status: string;
  startTime: Date;
  endTime: Date;
  totalBudget: number;
  ruleConfig: any;
}

async function seedTestData() {
  const dataSource = await AppDataSource.initialize();
  const campaignRepo = dataSource.getRepository('Campaign');

  await campaignRepo.clear();

  const testCampaigns: CampaignData[] = [
    {
      title: '618大促抽奖活动',
      description: '618购物节期间的用户抽奖活动',
      status: 'active',
      startTime: new Date('2024-06-01'),
      endTime: new Date('2024-06-20'),
      totalBudget: 50000,
      ruleConfig: { maxParticipants: 10000, dailyLimit: 3 }
    },
    {
      title: '新用户注册红包',
      description: '针对新用户的注册奖励活动',
      status: 'active',
      startTime: new Date('2024-05-01'),
      endTime: new Date('2024-12-31'),
      totalBudget: 200000,
      ruleConfig: { newUserOnly: true, rewardAmount: 10 }
    },
    {
      title: '春节集卡活动',
      description: '春节期间的集卡兑奖活动',
      status: 'ended',
      startTime: new Date('2024-01-20'),
      endTime: new Date('2024-02-10'),
      totalBudget: 300000,
      ruleConfig: { cardTypes: 6, completeReward: 888 }
    },
    {
      title: '双11预热活动',
      description: '双11前的预热小游戏',
      status: 'draft',
      startTime: new Date('2024-10-20'),
      endTime: new Date('2024-11-11'),
      totalBudget: 150000,
      ruleConfig: { gameType: 'slot_machine' }
    },
    {
      title: '会员日专属活动',
      description: '每月会员日的专属福利',
      status: 'active',
      startTime: new Date('2024-06-15'),
      endTime: new Date('2024-06-16'),
      totalBudget: 80000,
      ruleConfig: { vipLevelRequired: 2 }
    }
  ];

  for (const data of testCampaigns) {
    await campaignRepo.save(data);
  }

  console.log('✅ 成功创建5条测试活动数据');
  console.log('   - 进行中: 3个');
  console.log('   - 已结束: 1个');
  console.log('   - 未开始: 1个');
  
  await dataSource.destroy();
  process.exit(0);
}

seedTestData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
