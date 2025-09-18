import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    // читаем .env, делаем конфиг глобальным
    ConfigModule.forRoot({ isGlobal: true }),

    // подключение к Postgres через TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: parseInt(config.get<string>('POSTGRES_PORT', '5432'), 10),
        username: config.get<string>('POSTGRES_USER', 'student'),
        password: config.get<string>('POSTGRES_PASSWORD', 'student'),
        database: config.get<string>('POSTGRES_DB', 'kupipodariday'),
        autoLoadEntities: true,   // будет подхватывать сущности из модулей
        synchronize: true,        // только для dev!
      }),
    }),

    UsersModule,

    WishesModule,

    WishlistsModule,

    OffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
