import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly repo: Repository<Wish>,
  ) {}

  create(dto: CreateWishDto): Promise<Wish> {
    const entity = this.repo.create({
      ...dto,
      raised: 0,
      copied: 0,
    });
    return this.repo.save(entity);
  }

  findMany(
    where: FindOptionsWhere<Wish> = {},
    options: Omit<FindManyOptions<Wish>, 'where'> = {},
  ): Promise<Wish[]> {
    return this.repo.find({
      where,
      relations: { owner: true },
      ...options,
    });
  }

  findOne(where: FindOptionsWhere<Wish>): Promise<Wish | null> {
    return this.repo.findOne({
      where,
      relations: { owner: true, offers: true },
    });
  }

  async updateOne(
    where: FindOptionsWhere<Wish>,
    dto: UpdateWishDto,
  ): Promise<Wish> {
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

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async removeOne(where: FindOptionsWhere<Wish>): Promise<{ deleted: true }> {
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

  createForOwner(ownerId: number, dto: CreateWishDto): Promise<Wish> {
    const payload: Partial<Wish> = {
      ...dto,
      owner: { id: ownerId } as unknown as User,
      raised: 0,
      copied: 0,
    };
    return this.repo.save(this.repo.create(payload));
  }

  async updateOwned(
    id: number,
    ownerId: number,
    dto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.repo.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== ownerId) {
      throw new ForbiddenException('Редактирование чужого подарка запрещено');
    }
    return this.updateOne({ id }, dto);
  }

  async removeOwned(id: number, ownerId: number): Promise<{ deleted: true }> {
    const wish = await this.repo.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== ownerId) {
      throw new ForbiddenException('Удаление чужого подарка запрещено');
    }
    return this.removeOne({ id });
  }

  async copyForUser(srcId: number, userId: number): Promise<Wish> {
    const src = await this.repo.findOne({ where: { id: srcId } });
    if (!src) throw new NotFoundException('Wish not found');

    const payload: import('typeorm').DeepPartial<Wish> = {
      name: src.name,
      link: src.link,
      image: src.image,
      price: src.price,
      description: src.description ?? undefined,
      owner: { id: userId } as unknown as User,
      copiedFrom: { id: srcId } as unknown as Wish,
      raised: 0,
      copied: 0,
    };

    const newWish = this.repo.create(payload);
    const saved = await this.repo.save(newWish);

    await this.repo.increment({ id: srcId }, 'copied', 1);
    return saved;
  }
}
