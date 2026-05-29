import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() data: any) {
    return this.tenantsService.create(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.update(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/renew')
  renew(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.renew(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body('type') type: string) {
    return this.tenantsService.resetPassword(id, type);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.tenantsService.getStatistics(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/assign-user')
  assignUser(@Param('id') id: string, @Body('user_id') userId: string) {
    return this.tenantsService.assignUser(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/users')
  getUsers(@Param('id') id: string) {
    return this.tenantsService.getUsers(id);
  }
}
