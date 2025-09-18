import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { DeepPartial } from 'typeorm';

@Injectable()
export class WishesService {
  constructor(@InjectRepository(Wish) private repo: Repository<Wish>) {}

  async create(dto: CreateWishDto) {
    const entity = this.repo.create(dto as DeepPartial<Wish>);
    entity.raised ??= 0;
    entity.copied ??= 0;
    return this.repo.save(entity);
  }

  async findMany(
    where: FindOptionsWhere<Wish> = {},
    options: Omit<FindManyOptions<Wish>, 'where'> = {},
  ) {
    return this.repo.find({ where, ...options });
  }

  async findOne(where: FindOptionsWhere<Wish>) {
    return this.repo.findOne({
      where,
      relations: { owner: true, offers: true },
    });
  }

  // пример бизнес-правила: нельзя менять цену, если уже есть офферы
  async updateOne(where: FindOptionsWhere<Wish>, dto: any) {
    const existing = await this.repo.findOne({
      where,
      relations: { offers: true },
    });
    if (!existing) throw new NotFoundException('Wish not found');

    if (dto.price !== undefined && existing.offers?.length) {
      throw new BadRequestException(
        'Нельзя менять стоимость — уже есть офферы',
      );
    }

    const merged = this.repo.merge(existing, dto);
    return this.repo.save(merged);
  }

  async removeOne(where: FindOptionsWhere<Wish>) {
    const existing = await this.repo.findOne({
      where,
      relations: { offers: true },
    });
    if (!existing) throw new NotFoundException('Wish not found');
    if (existing.offers?.length) {
      throw new BadRequestException('Нельзя удалить подарок — есть офферы');
    }
    await this.repo.remove(existing);
    return { deleted: true };
  }
}
