import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async findAll(query: { page?: number; limit?: number; name?: string; phone?: string; staff_id?: string }) {
    const { page = 1, limit = 10, name, phone, staff_id } = query;
    const skip = (page - 1) * limit;
    const where: any = { is_deleted: false };
    if (name) where.name = Like(`%${name}%`);
    if (phone) where.phone = Like(`%${phone}%`);
    if (staff_id) where.staff_id = staff_id;
    const [data, total] = await this.customersRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findOne({ where: { id, is_deleted: false } });
    if (!customer) throw new NotFoundException('客户不存在');
    return customer;
  }

  async getStatistics() {
    const total = await this.customersRepository.count({ where: { is_deleted: false } });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayNew = await this.customersRepository.count({
      where: { is_deleted: false, created_at: MoreThanOrEqual(todayStart) },
    });
    return { total, todayNew };
  }
}
