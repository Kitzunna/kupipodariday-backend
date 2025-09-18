import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private hash: HashService,
    private jwt: JwtService,
  ) {}

  // signup: хешируем пароль, создаём пользователя
  async signup(dto: CreateUserDto) {
    const exists = await this.users.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already registered');

    const password = await this.hash.hash(dto.password);
    const user = await this.users.create({
      ...dto,
      password,
      about: dto.about ?? 'Пока ничего не рассказал о себе',
      avatar: dto.avatar ?? 'https://i.pravatar.cc/300',
    });

    return this.issueToken(user.id, user.username);
  }

  // валидация для LocalStrategy
  async validateUser(username: string, password: string) {
    const user = await this.users.findOneWithPassword({ username });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await this.hash.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user; // вернём пользователя (без пароля в select по умолчанию)
  }

  // signin: LocalStrategy положит user в req, мы выдаём jwt
  async signin(userId: number, username: string) {
    return this.issueToken(userId, username);
  }

  private issueToken(sub: number, username: string) {
    const payload = { sub, username };
    return { access_token: this.jwt.sign(payload) };
  }
}
