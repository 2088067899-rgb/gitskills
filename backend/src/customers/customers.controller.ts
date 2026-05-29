import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  findAll(@Query() query: any) {
    return this.customersService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('statistics')
  getStatistics() {
    return this.customersService.getStatistics();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }
}
