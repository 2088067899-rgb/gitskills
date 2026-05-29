import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { RedPacket, RedPacketType, RedPacketStatus } from '../entities/red-packet.entity';

@Injectable()
export class RedPacketService {
  constructor(
    @InjectRepository(RedPacket)
    private redPacketRepository: Repository<RedPacket>,
  ) {}

  private generatePacketId(): string {
    return `RP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  async findAll(query: { page?: number; limit?: number; status?: RedPacketStatus }) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await this.redPacketRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const packet = await this.redPacketRepository.findOne({ where: { id } });
    if (!packet) throw new NotFoundException('红包不存在');
    return packet;
  }

  async create(data: any, user: any) {
    const packet = this.redPacketRepository.create({
      packet_id: this.generatePacketId(),
      amount: data.amount,
      type: data.type || RedPacketType.FIXED,
      title: data.title,
      description: data.description,
      expire_at: data.expire_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sender_id: user.id,
      sender_name: user.nickname || user.username,
      status: RedPacketStatus.AVAILABLE,
    });
    return await this.redPacketRepository.save(packet);
  }
}
