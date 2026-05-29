import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffPromotionStats } from '../entities/staff-promotion-stats.entity';

@Injectable()
export class StaffStatsService {
  constructor(
    @InjectRepository(StaffPromotionStats)
    private statsRepository: Repository<StaffPromotionStats>,
  ) {}

  private today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private async getOrCreate(staffId: string): Promise<StaffPromotionStats> {
    const date = this.today();
    let stat = await this.statsRepository.findOne({ where: { staff_id: staffId, date } });
    if (!stat) {
      stat = this.statsRepository.create({ staff_id: staffId, date, share_count: 0, view_count: 0, participate_count: 0, conversion_count: 0, total_order_amount: 0 });
    }
    return stat;
  }

  async getStaffStatistics() {
    const data = await this.statsRepository.find({ order: { date: 'DESC' } });
    const total = data.reduce((acc, r) => ({
      share_count: (acc.share_count || 0) + r.share_count,
      view_count: (acc.view_count || 0) + r.view_count,
      participate_count: (acc.participate_count || 0) + r.participate_count,
      conversion_count: (acc.conversion_count || 0) + r.conversion_count,
      total_order_amount: (acc.total_order_amount || 0) + Number(r.total_order_amount),
    }), {} as any);
    return { data, total };
  }

  async getStaffStats(staffId: string) {
    const data = await this.statsRepository.find({ where: { staff_id: staffId }, order: { date: 'DESC' } });
    const total = data.reduce((acc, r) => ({
      share_count: (acc.share_count || 0) + r.share_count,
      view_count: (acc.view_count || 0) + r.view_count,
      participate_count: (acc.participate_count || 0) + r.participate_count,
      conversion_count: (acc.conversion_count || 0) + r.conversion_count,
      total_order_amount: (acc.total_order_amount || 0) + Number(r.total_order_amount),
    }), {} as any);
    return { data, total };
  }

  async recordShare(staffId: string) {
    const stat = await this.getOrCreate(staffId);
    stat.share_count += 1;
    await this.statsRepository.save(stat);
    return { message: '记录成功' };
  }

  async recordView(staffId: string) {
    const stat = await this.getOrCreate(staffId);
    stat.view_count += 1;
    await this.statsRepository.save(stat);
    return { message: '记录成功' };
  }

  async recordParticipate(staffId: string) {
    const stat = await this.getOrCreate(staffId);
    stat.participate_count += 1;
    await this.statsRepository.save(stat);
    return { message: '记录成功' };
  }

  async recordConversion(data: any) {
    const stat = await this.getOrCreate(data.staff_id);
    stat.conversion_count += 1;
    stat.total_order_amount = Number(stat.total_order_amount) + Number(data.order_amount || 0);
    await this.statsRepository.save(stat);
    return { message: '记录成功' };
  }
}
