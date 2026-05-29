import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyReportService } from './daily-report.service';

@Controller('daily-report')
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:userId/stats')
  getUserStats(@Param('userId') userId: string, @Query() query: any) {
    return this.dailyReportService.getUserStats(userId, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  getAllUsersReport(@Query('date') date: string) {
    return this.dailyReportService.getAllUsersReport(date);
  }
}
