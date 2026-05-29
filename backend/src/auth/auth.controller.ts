import { Controller, Post, Body, Get, Request, UseGuards, Put, Param, Query, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, PhoneLoginDto, SendCodeDto, WechatLoginDto, WechatBindDto, CreateStaffDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('auth/web-login')
  async webLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('auth/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('auth/profile')
  async updateProfile(@Request() req, @Body() data: any) {
    return this.authService.updateProfile(req.user.id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('auth/change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('auth/logout')
  async logout() {
    return { message: '退出成功' };
  }

  @Post('auth/send-code')
  async sendCode(@Body() sendCodeDto: SendCodeDto) {
    return this.authService.sendCode(sendCodeDto);
  }

  @Post('auth/phone-login')
  async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.phoneLogin(phoneLoginDto);
  }

  @Post('auth/wechat-login')
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  @Post('auth/wechat-bind')
  async bindWechat(@Body() wechatBindDto: WechatBindDto) {
    return this.authService.bindWechat(wechatBindDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/users')
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.authService.getUsers(page || 1, limit || 10);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('auth/users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.authService.updateUser(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('auth/users/:id/authorize')
  async authorizeUser(@Param('id') id: string, @Body('is_admin') isAdmin: boolean) {
    return this.authService.authorizeUser(id, isAdmin);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('auth/users/:id/delete')
  async deleteUser(@Param('id') id: string) {
    return this.authService.softDeleteUser(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('auth/create-staff')
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.authService.createStaff(createStaffDto);
  }
}
