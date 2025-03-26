import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.refreshToken,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = req.cookies.refreshToken;
    const isBlacklisted = await this.redisClient.get(`blacklist:${payload.jti}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    
    return { ...payload, refreshToken: token };
  }
}