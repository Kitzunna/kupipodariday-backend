import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';

type LocalUser = { id: number; username: string };
type ReqWithUser = ExpressRequest & { user: LocalUser };

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.auth.signup(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signin(@Request() req: ReqWithUser) {
    return this.auth.signin(req.user.id, req.user.username);
  }
}
