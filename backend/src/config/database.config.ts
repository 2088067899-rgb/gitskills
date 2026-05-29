import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'data/app.sqlite',
  entities: [__dirname + '/../entities/*.entity.{js,ts}'],
  synchronize: true,
  logging: false,
};
