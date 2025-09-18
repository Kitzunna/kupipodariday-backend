import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, WishlistItem])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [TypeOrmModule, WishlistsService],
})
export class WishlistsModule {}
