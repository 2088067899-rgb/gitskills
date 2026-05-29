import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StaffStatsService } from './staff-stats.service';

@Controller()
export class StaffStatsController {
  constructor(private readonly staffStatsService: StaffStatsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('staff/statistics')
  getStaffStatistics() {
    return this.staffStatsService.getStaffStatistics();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('staff-stats/:staffId')
  getStaffStats(@Param('staffId') staffId: string) {
    return this.staffStatsService.getStaffStats(staffId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('staff-stats/share/:staffId')
  recordShare(@Param('staffId') staffId: string) {
    return this.staffStatsService.recordShare(staffId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('staff-stats/view/:staffId')
  recordView(@Param('staffId') staffId: string) {
    return this.staffStatsService.recordView(staffId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('staff-stats/participate/:staffId')
  recordParticipate(@Param('staffId') staffId: string) {
    return this.staffStatsService.recordParticipate(staffId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('staff-stats/conversion')
  recordConversion(@Body() data: any) {
    return this.staffStatsService.recordConversion(data);
  }
}
