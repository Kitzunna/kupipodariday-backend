import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('offers')
export class OffersController {
  constructor(private readonly offers: OffersService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offers.findOne({ id });
  }

  // создание заявки (только авторизованные)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@CurrentUser() user: { userId: number }, @Body() dto: CreateOfferDto) {
    return this.offers.createForUser(user.userId, dto);
  }

  // намеренно НЕ делаем PATCH/DELETE — «передумать здесь нельзя»
}
