import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from '../entities/campaign.entity';
import { User } from '../entities/user.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private generateCampaignId(): string {
    const prefix = 'A';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${month}${day}${random}`;
  }

  async create(createCampaignDto: CreateCampaignDto, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const campaign = this.campaignsRepository.create({
      title: createCampaignDto.title,
      description: createCampaignDto.description,
      type: createCampaignDto.type as any,
      start_time: new Date(createCampaignDto.start_time),
      end_time: new Date(createCampaignDto.end_time),
      budget: createCampaignDto.budget,
      cover_image: createCampaignDto.cover_image,
      settings: createCampaignDto.settings,
      share_config: createCampaignDto.share_config,
      campaign_id: this.generateCampaignId(),
      merchant_id: user.id,
      merchant_name: user.merchant_name || user.nickname || user.username,
      statistics: { views: 0, participates: 0, registrations: 0, payments: 0, offline: 0 },
      status: CampaignStatus.DRAFT,
    });
    return await this.campaignsRepository.save(campaign);
  }

  async findAll(query: { page?: number; limit?: number; title?: string; status?: CampaignStatus }) {
    const { page = 1, limit = 10, title, status } = query;
    const skip = (page - 1) * limit;
    const where: any = { is_deleted: false };
    if (title) where.title = Like(`%${title}%`);
    if (status) where.status = status;
    const [data, total] = await this.campaignsRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findActive() {
    const now = new Date();
    const data = await this.campaignsRepository.find({
      where: {
        status: CampaignStatus.ACTIVE,
        is_deleted: false,
        start_time: LessThanOrEqual(now),
        end_time: MoreThanOrEqual(now),
      },
      order: { created_at: 'DESC' },
    });
    return data;
  }

  async findOne(id: number) {
    const campaign = await this.campaignsRepository.findOne({ where: { id, is_deleted: false } });
    if (!campaign) throw new NotFoundException('活动不存在');
    return campaign;
  }

  async update(id: number, updateData: Partial<Campaign>) {
    const campaign = await this.findOne(id);
    Object.assign(campaign, updateData);
    return await this.campaignsRepository.save(campaign);
  }

  async updateStatus(id: number, status: CampaignStatus) {
    const campaign = await this.findOne(id);
    campaign.status = status;
    return await this.campaignsRepository.save(campaign);
  }

  async delete(id: number) {
    const campaign = await this.findOne(id);
    campaign.is_deleted = true;
    campaign.deleted_at = new Date();
    await this.campaignsRepository.save(campaign);
    return { message: '删除成功' };
  }

  async getStatistics(userId: string) {
    const [total, active, draft, ended] = await Promise.all([
      this.campaignsRepository.count({ where: { is_deleted: false } }),
      this.campaignsRepository.count({ where: { status: CampaignStatus.ACTIVE, is_deleted: false } }),
      this.campaignsRepository.count({ where: { status: CampaignStatus.DRAFT, is_deleted: false } }),
      this.campaignsRepository.count({ where: { status: CampaignStatus.ENDED, is_deleted: false } }),
    ]);
    return { total, active, draft, ended };
  }

  async getDashboard() {
    const now = new Date();
    const [totalCampaigns, activeCampaigns] = await Promise.all([
      this.campaignsRepository.count({ where: { is_deleted: false } }),
      this.campaignsRepository.count({
        where: { status: CampaignStatus.ACTIVE, is_deleted: false, start_time: LessThanOrEqual(now), end_time: MoreThanOrEqual(now) },
      }),
    ]);
    const campaigns = await this.campaignsRepository.find({ where: { is_deleted: false }, select: ['statistics'] as any });
    const totalViews = campaigns.reduce((sum, c) => sum + ((c.statistics as any)?.views || 0), 0);
    const totalParticipates = campaigns.reduce((sum, c) => sum + ((c.statistics as any)?.participates || 0), 0);
    return { totalCampaigns, activeCampaigns, totalViews, totalParticipates };
  }
}
