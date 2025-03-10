import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { User } from '@prisma/client';
import e from 'express';
import { AccessToken } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async login(user: { id: string; email: string; username: string }): Promise<AccessToken> {
    const payload = { sub: user.id, email: user.email, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: RegisterRequestDto): Promise<AccessToken> {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('Email already taken');
    }

    const existingUsername = await this.userService.findByUsername(user.username);
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }
    
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.userService.createUser({
      email: user.email,
      username: user.username,
      passwordHash: hashedPassword
    });
    return await this.login({ id: newUser.id.toString(), email: newUser.email, username: newUser.username });
  }
}
