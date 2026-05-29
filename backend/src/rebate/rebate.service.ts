import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RebateRecord, RebateStatus } from '../entities/rebate-record.entity';

@Injectable()
export class RebateService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RebateRecord)
    private rebateRepository: Repository<RebateRecord>,
  ) {}

  async getInviteCode(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (!user.invite_code) {
      const code = `INV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      user.invite_code = code;
      await this.usersRepository.save(user);
    }
    return { invite_code: user.invite_code };
  }

  async getBalance(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return { balance: Number(user.rebate_balance) };
  }

  async getRecords(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.rebateRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStatistics(userId: string) {
    const result = await this.rebateRepository
      .createQueryBuilder('rebate')
      .select('SUM(rebate.amount)', 'totalAmount')
      .addSelect('COUNT(*)', 'totalCount')
      .where('rebate.user_id = :userId', { userId })
      .getRawOne();
    return {
      totalAmount: Number(result?.totalAmount || 0),
      totalCount: Number(result?.totalCount || 0),
      balance: 0,
    };
  }
}
