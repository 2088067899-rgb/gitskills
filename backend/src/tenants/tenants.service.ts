import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../entities/tenant.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const data = await this.tenantsRepository.find({ where: { is_deleted: false }, order: { created_at: 'DESC' } });
    return data;
  }

  async findOne(id: string) {
    const tenant = await this.tenantsRepository.findOne({ where: { id, is_deleted: false } });
    if (!tenant) throw new NotFoundException('租户不存在');
    return tenant;
  }

  async create(data: any) {
    const existing = await this.tenantsRepository.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException('租户名称已存在');
    const tenant = this.tenantsRepository.create(data);
    return await this.tenantsRepository.save(tenant);
  }

  async update(id: string, data: any) {
    const tenant = await this.findOne(id);
    Object.assign(tenant, data);
    return await this.tenantsRepository.save(tenant);
  }

  async renew(id: string, data: any) {
    const tenant = await this.findOne(id);
    const months = data.months || 1;
    const currentExpire = tenant.expire_at ? new Date(tenant.expire_at) : new Date();
    const newExpire = new Date(currentExpire);
    newExpire.setMonth(newExpire.getMonth() + months);
    tenant.expire_at = newExpire;
    await this.tenantsRepository.save(tenant);
    return { message: `续费成功，有效期至 ${newExpire.toISOString().split('T')[0]}` };
  }

  async resetPassword(id: string, type: string) {
    const tenant = await this.findOne(id);
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (type === 'admin') {
      const admin = await this.usersRepository.findOne({ where: { tenant_id: id, role: UserRole.ADMIN } });
      if (admin) {
        admin.password = hashedPassword;
        await this.usersRepository.save(admin);
      }
    } else {
      const users = await this.usersRepository.find({ where: { tenant_id: id } });
      for (const u of users) {
        u.password = hashedPassword;
        await this.usersRepository.save(u);
      }
    }
    return { message: '密码重置成功，新密码: 123456' };
  }

  async getStatistics(id: string) {
    const tenant = await this.findOne(id);
    const userCount = await this.usersRepository.count({ where: { tenant_id: id } });
    return {
      name: tenant.name,
      userCount,
      expireAt: tenant.expire_at,
      isActive: tenant.is_active,
      createdAt: tenant.created_at,
    };
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);
    tenant.is_deleted = true;
    await this.tenantsRepository.save(tenant);
    return { message: '删除成功' };
  }

  async assignUser(tenantId: string, userId: string) {
    const tenant = await this.findOne(tenantId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    user.tenant_id = tenantId;
    await this.usersRepository.save(user);
    tenant.user_count = await this.usersRepository.count({ where: { tenant_id: tenantId } });
    await this.tenantsRepository.save(tenant);
    return { message: '分配成功' };
  }

  async getUsers(tenantId: string) {
    await this.findOne(tenantId);
    const users = await this.usersRepository.find({ where: { tenant_id: tenantId } });
    return users.map(({ password, ...u }) => u);
  }
}
