import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HashService } from '../hash/hash.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly hash: HashService,
  ) {}

  // ---- ПРОСМОТР СВОЕГО ПРОФИЛЯ
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@CurrentUser() user: { userId: number }) {
    return this.users.findOne({ id: user.userId });
  }

  // ---- РЕДАКТИРОВАТЬ СВОЙ ПРОФИЛЬ
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateMe(
    @CurrentUser() user: { userId: number },
    @Body() dto: UpdateUserDto,
  ) {
    // если меняем пароль — обязательно хешируем
    if (dto.password) {
      dto.password = await this.hash.hash(dto.password);
    }
    return this.users.updateOne({ id: user.userId }, dto);
  }

  @Get('search')
  search(@Query('query') query: string) {
    return this.users.search(query);
  }
  
  // ---- ПРОСМОТР ЧУЖОГО ПРОФИЛЯ ПО ID
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.users.findOne({ id: Number(id) });
  }
}
