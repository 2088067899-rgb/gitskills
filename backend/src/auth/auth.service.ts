import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto, PhoneLoginDto, SendCodeDto, WechatLoginDto, WechatBindDto, CreateStaffDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private verificationCodes: Map<string, { code: string; expire: Date }> = new Map();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private generateToken(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      merchant_id: user.merchant_id,
      tenant_id: user.tenant_id,
    };
    return this.jwtService.sign(payload);
  }

  private buildUserResponse(user: any) {
    const { password, ...result } = user;
    return {
      access_token: this.generateToken(user),
      user: result,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException('账号已锁定');
    }
    await this.usersRepository.update(user.id, { last_login_at: new Date() });
    return this.buildUserResponse(user);
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      nickname: registerDto.nickname,
      phone: registerDto.phone,
      role: registerDto.merchant_name ? UserRole.MERCHANT : UserRole.OPERATOR,
      merchant_name: registerDto.merchant_name,
      settings: {
        theme: 'light',
        notification: true,
        language: 'zh-CN',
      },
    });
    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('原密码错误');
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });
    return { message: '密码修改成功' };
  }

  async updateProfile(userId: string, data: Partial<User>) {
    await this.usersRepository.update(userId, data);
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    const { password, ...result } = user;
    return result;
  }

  async sendCode(sendCodeDto: SendCodeDto) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodes.set(sendCodeDto.phone, {
      code,
      expire: new Date(Date.now() + 5 * 60 * 1000),
    });
    console.log(`[验证码] 手机号: ${sendCodeDto.phone}, 验证码: ${code}`);
    return { success: true, message: '验证码已发送，请查看后端终端', code };
  }

  private verifyCode(phone: string, code: string): boolean {
    const stored = this.verificationCodes.get(phone);
    if (!stored) return false;
    if (new Date() > stored.expire) {
      this.verificationCodes.delete(phone);
      return false;
    }
    return stored.code === code;
  }

  async phoneLogin(phoneLoginDto: PhoneLoginDto) {
    if (!this.verifyCode(phoneLoginDto.phone, phoneLoginDto.code)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    this.verificationCodes.delete(phoneLoginDto.phone);
    let user = await this.usersRepository.findOne({ where: { phone: phoneLoginDto.phone } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = this.usersRepository.create({
        username: phoneLoginDto.phone,
        password: hashedPassword,
        nickname: `用户${phoneLoginDto.phone.slice(-4)}`,
        phone: phoneLoginDto.phone,
        role: UserRole.STAFF,
        settings: { theme: 'light', notification: true, language: 'zh-CN' },
      });
      await this.usersRepository.save(user);
    }
    await this.usersRepository.update(user.id, { last_login_at: new Date() });
    return this.buildUserResponse(user);
  }

  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    const openid = `mock_openid_${wechatLoginDto.code}`;
    let user = await this.usersRepository.findOne({ where: { wechat_openid: openid } });
    if (!user) {
      throw new UnauthorizedException('该微信未绑定账号，请先绑定');
    }
    await this.usersRepository.update(user.id, { last_login_at: new Date() });
    return this.buildUserResponse(user);
  }

  async bindWechat(wechatBindDto: WechatBindDto) {
    const user = await this.validateUser(wechatBindDto.username, wechatBindDto.password);
    if (!user) throw new UnauthorizedException('用户名或密码错误');
    const existing = await this.usersRepository.findOne({ where: { wechat_openid: wechatBindDto.openid } });
    if (existing && existing.id !== user.id) {
      throw new ConflictException('该微信已被其他账号绑定');
    }
    await this.usersRepository.update(user.id, { wechat_openid: wechatBindDto.openid });
    return { message: '绑定成功' };
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    const users = data.map(({ password, ...u }) => u);
    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUser(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.usersRepository.update(id, data);
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const { password, ...result } = user;
    return result;
  }

  async authorizeUser(id: string, isAdmin: boolean) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    user.role = isAdmin ? UserRole.ADMIN : UserRole.STAFF;
    await this.usersRepository.save(user);
    return { message: isAdmin ? '已授权为管理员' : '已取消管理员权限' };
  }

  async softDeleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    user.status = UserStatus.INACTIVE;
    await this.usersRepository.save(user);
    return { message: '删除成功' };
  }

  async createStaff(createStaffDto: CreateStaffDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: createStaffDto.username },
    });
    if (existingUser) throw new ConflictException('用户名已存在');
    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);
    const user = this.usersRepository.create({
      username: createStaffDto.username,
      password: hashedPassword,
      nickname: createStaffDto.nickname,
      phone: createStaffDto.phone,
      store_id: createStaffDto.store_id,
      role: UserRole.STAFF,
      settings: { theme: 'light', notification: true, language: 'zh-CN' },
    });
    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }
}
