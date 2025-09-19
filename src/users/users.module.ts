import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { HashModule } from '../hash/hash.module';
import { WishesModule } from '../wishes/wishes.module'; // ← добавили

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HashModule,
    WishesModule, // ← важно: даёт доступ к WishesService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
