import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedPacketService } from './red-packet.service';

@Controller('red-packets')
export class RedPacketController {
  constructor(private readonly redPacketService: RedPacketService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: any) {
    return this.redPacketService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redPacketService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() data: any, @Request() req) {
    return this.redPacketService.create(data, req.user);
  }
}
