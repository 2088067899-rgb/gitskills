import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RebateService } from './rebate.service';

@Controller('rebate')
export class RebateController {
  constructor(private readonly rebateService: RebateService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('invite-code')
  getInviteCode(@Request() req) {
    return this.rebateService.getInviteCode(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  getBalance(@Request() req) {
    return this.rebateService.getBalance(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('records')
  getRecords(@Request() req, @Query('page') page: number, @Query('limit') limit: number) {
    return this.rebateService.getRecords(req.user.id, page || 1, limit || 20);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('statistics')
  getStatistics(@Request() req) {
    return this.rebateService.getStatistics(req.user.id);
  }
}
