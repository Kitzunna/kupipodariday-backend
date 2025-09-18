import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.auth.signup(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signin(@Request() req: any) {
    // req.user положен LocalStrategy (validate вернул user)
    return this.auth.signin(req.user.id, req.user.username);
  }
}
