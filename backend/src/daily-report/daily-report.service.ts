import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyReport } from '../entities/daily-report.entity';

@Injectable()
export class DailyReportService {
  constructor(
    @InjectRepository(DailyReport)
    private dailyReportRepository: Repository<DailyReport>,
  ) {}

  async getUserStats(userId: string, query: { start_date?: string; end_date?: string }) {
    const { start_date, end_date } = query;
    const where: any = { user_id: userId };
    if (start_date && end_date) {
      where.date = Between(start_date, end_date);
    }
    const data = await this.dailyReportRepository.find({
      where,
      order: { date: 'DESC' },
    });
    const total = data.reduce((acc, r) => ({
      new_customers: (acc.new_customers || 0) + r.new_customers,
      visits: (acc.visits || 0) + r.visits,
      orders: (acc.orders || 0) + r.orders,
      order_amount: (acc.order_amount || 0) + Number(r.order_amount),
      shares: (acc.shares || 0) + r.shares,
      views: (acc.views || 0) + r.views,
    }), {} as any);
    return { data, total };
  }

  async getAllUsersReport(date?: string) {
    const where: any = {};
    if (date) where.date = date;
    const data = await this.dailyReportRepository.find({
      where,
      order: { date: 'DESC' },
    });
    const total = data.reduce((acc, r) => ({
      new_customers: (acc.new_customers || 0) + r.new_customers,
      visits: (acc.visits || 0) + r.visits,
      orders: (acc.orders || 0) + r.orders,
      order_amount: (acc.order_amount || 0) + Number(r.order_amount),
      shares: (acc.shares || 0) + r.shares,
      views: (acc.views || 0) + r.views,
    }), {} as any);
    return { data, total };
  }
}
