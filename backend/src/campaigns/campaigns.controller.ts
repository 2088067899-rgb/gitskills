import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignStatus } from '../entities/campaign.entity';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignsService.create(createCampaignDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: CampaignStatus,
    @Query('title') title: string,
  ) {
    return this.campaignsService.findAll({ page, limit, status, title });
  }

  @Get('active')
  findActive() {
    return this.campaignsService.findActive();
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.campaignsService.getStatistics(req.user?.id || 'default');
  }

  @Get('dashboard')
  getDashboard() {
    return this.campaignsService.getDashboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.campaignsService.update(+id, updateData);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: CampaignStatus) {
    return this.campaignsService.updateStatus(+id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignsService.delete(+id);
  }
}
