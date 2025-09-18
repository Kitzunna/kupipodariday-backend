import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(@InjectRepository(Offer) private repo: Repository<Offer>) {}

  async create(dto: any) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findMany(
    where: FindOptionsWhere<Offer> = {},
    options: Omit<FindManyOptions<Offer>, 'where'> = {},
  ) {
    return this.repo.find({ where, ...options });
  }

  async findOne(where: FindOptionsWhere<Offer>) {
    return this.repo.findOne({ where, relations: { user: true, wish: true } });
  }

  async updateOne(where: FindOptionsWhere<Offer>, dto: any) {
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new NotFoundException('Offer not found');
    const merged = this.repo.merge(existing, dto);
    return this.repo.save(merged);
  }

  async removeOne(where: FindOptionsWhere<Offer>) {
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new NotFoundException('Offer not found');
    await this.repo.remove(existing);
    return { deleted: true };
  }
}
