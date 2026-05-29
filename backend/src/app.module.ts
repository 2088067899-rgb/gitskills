import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { databaseConfig } from './config/database.config';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { Campaign } from './entities/campaign.entity';
import { User } from './entities/user.entity';
import { Commission } from './entities/commission.entity';
import { RedPacket } from './entities/red-packet.entity';
import { Tenant } from './entities/tenant.entity';
import { Customer } from './entities/customer.entity';
import { DailyReport } from './entities/daily-report.entity';
import { RebateRecord } from './entities/rebate-record.entity';
import { StaffPromotionStats } from './entities/staff-promotion-stats.entity';
import { BrowseLog } from './entities/browse-log.entity';
import { Order } from './entities/order.entity';
import { AuditLog } from './entities/audit-log.entity';
import { CampaignsController } from './campaigns/campaigns.controller';
import { CampaignsService } from './campaigns/campaigns.service';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { DailyReportController } from './daily-report/daily-report.controller';
import { DailyReportService } from './daily-report/daily-report.service';
import { RebateController } from './rebate/rebate.controller';
import { RebateService } from './rebate/rebate.service';
import { StaffStatsController } from './staff-stats/staff-stats.controller';
import { StaffStatsService } from './staff-stats/staff-stats.service';
import { TenantsController } from './tenants/tenants.controller';
import { TenantsService } from './tenants/tenants.service';
import { RedPacketController } from './red-packet/red-packet.controller';
import { RedPacketService } from './red-packet/red-packet.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/app.sqlite',
      entities: [Campaign, User, Commission, RedPacket, Tenant, Customer, DailyReport, RebateRecord, StaffPromotionStats, BrowseLog, Order, AuditLog],
      synchronize: true,
      logging: false,
    }),

    TypeOrmModule.forFeature([Campaign, User, Commission, RedPacket, Tenant, Customer, DailyReport, RebateRecord, StaffPromotionStats, BrowseLog, Order, AuditLog]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    CampaignsController,
    CustomersController,
    DailyReportController,
    RebateController,
    StaffStatsController,
    TenantsController,
    RedPacketController,
  ],
  providers: [
    JwtStrategy,
    AuthService,
    CampaignsService,
    CustomersService,
    DailyReportService,
    RebateService,
    StaffStatsService,
    TenantsService,
    RedPacketService,
  ],
})
export class AppModule {}
