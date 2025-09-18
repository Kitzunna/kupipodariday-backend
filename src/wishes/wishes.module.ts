import { Module } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';

@Module({
  providers: [WishesService],
  controllers: [WishesController]
})
export class WishesModule {}
