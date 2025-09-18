import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private wlRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem) private itemRepo: Repository<WishlistItem>,
  ) {}

  async create(dto: any) {
    const wl = this.wlRepo.create(dto);
    return this.wlRepo.save(wl);
  }

  async findMany(
    where: FindOptionsWhere<Wishlist> = {},
    options: Omit<FindManyOptions<Wishlist>, 'where'> = {},
  ) {
    return this.wlRepo.find({ where, relations: { items: { wish: true }, owner: true }, ...options });
  }

  async findOne(where: FindOptionsWhere<Wishlist>) {
    return this.wlRepo.findOne({ where, relations: { items: { wish: true }, owner: true } });
  }

  async updateOne(where: FindOptionsWhere<Wishlist>, dto: any) {
    const existing = await this.wlRepo.findOne({ where });
    if (!existing) throw new NotFoundException('Wishlist not found');
    const merged = this.wlRepo.merge(existing, dto);
    return this.wlRepo.save(merged);
  }

  async removeOne(where: FindOptionsWhere<Wishlist>) {
    const existing = await this.wlRepo.findOne({ where });
    if (!existing) throw new NotFoundException('Wishlist not found');
    await this.wlRepo.remove(existing); // каскадом удалятся items
    return { deleted: true };
  }

  // удобные методы для элементов списка (необязательно, но пригодится)
  async addItem(wishlistId: number, wishId: number, position = 0) {
    const wl = await this.wlRepo.findOne({ where: { id: wishlistId } });
    if (!wl) throw new NotFoundException('Wishlist not found');
    const item = this.itemRepo.create({ wishlist: wl as any, wish: { id: wishId } as any, position });
    return this.itemRepo.save(item);
  }

  async removeItem(wishlistId: number, wishId: number) {
    const item = await this.itemRepo.findOne({ where: { wishlist: { id: wishlistId }, wish: { id: wishId } } });
    if (!item) throw new NotFoundException('Item not found');
    await this.itemRepo.remove(item);
    return { deleted: true };
  }
}
