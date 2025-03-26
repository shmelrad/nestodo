import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { RegisterRequestDto } from './dtos/register-request.dto'
import { User } from '@prisma/client'
import { AccessToken, UserPayload, TokensPair } from './auth.interface'
import { Redis } from 'ioredis'
import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'
@Injectable()
export class AuthService {
  private jwtSecret: string
  private jwtRefreshSecret: string
  private jwtAccessExpirationTime: string
  private jwtRefreshExpirationTime: string

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {
    const jwtAccessSecret = this.configService.get('JWT_ACCESS_SECRET')
    const jwtRefreshSecret = this.configService.get('JWT_REFRESH_SECRET')
    const jwtAccessExpirationTime = this.configService.get('JWT_ACCESS_EXPIRATION_TIME')
    const jwtRefreshExpirationTime = this.configService.get('JWT_REFRESH_EXPIRATION_TIME')

    if (!jwtAccessSecret || !jwtRefreshSecret || !jwtAccessExpirationTime || !jwtRefreshExpirationTime) {
      throw new Error('JWT secrets or expiration times are not set')
    }

    this.jwtSecret = jwtAccessSecret
    this.jwtRefreshSecret = jwtRefreshSecret
    this.jwtAccessExpirationTime = jwtAccessExpirationTime
    this.jwtRefreshExpirationTime = jwtRefreshExpirationTime
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username)
    if (!user) {
      throw new BadRequestException('User not found')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials')
    }

    return user
  }

  async login(user: User): Promise<TokensPair> {
    return await this.generateTokensPair(user)
  }

  async register(user: RegisterRequestDto): Promise<TokensPair> {
    const existingUser = await this.userService.findByEmail(user.email)
    if (existingUser) {
      throw new BadRequestException('Email already taken')
    }

    const existingUsername = await this.userService.findByUsername(user.username)
    if (existingUsername) {
      throw new BadRequestException('Username already taken')
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)
    const newUser = await this.userService.createUser({
      email: user.email,
      username: user.username,
      passwordHash: hashedPassword,
    })
    return await this.login(newUser)
  }

  async blacklistToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken, {
      secret: this.jwtRefreshSecret,
    })
    await this.redisClient.set(
      `blacklist:${decoded.jti}`,
      'true',
      'PX',
      decoded.exp * 1000 - Date.now(),
    );
  }
  
  async refreshTokens(userPayload: UserPayload & { refreshToken: string }): Promise<TokensPair> {
    const oldRefreshToken = userPayload.refreshToken;

    if (!oldRefreshToken) {
      throw new BadRequestException('No refresh token provided')
    }
    
    const decodedOld = this.jwtService.verify(oldRefreshToken, {
      secret: this.jwtRefreshSecret,
    });
    
    await this.redisClient.set(
      `blacklist:${decodedOld.jti}`,
      'true',
      'PX',
      decodedOld.exp * 1000 - Date.now(),
    );

    const userFromPayload = {
      id: userPayload.sub,
      email: userPayload.email,
      username: userPayload.username,
    };

    return await this.generateTokensPair(userFromPayload as User);
  }

  private generatePayload(user: User): UserPayload {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
    }
  }

  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtAccessExpirationTime,
      secret: this.jwtSecret,
    })
  }

  private generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtRefreshExpirationTime,
      secret: this.jwtRefreshSecret,
    })
  }

  private generateTokensPair(user: User): TokensPair {
    const payload = this.generatePayload(user)
    const refreshTokenPayload = { ...payload, jti: uuidv4() }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken(refreshTokenPayload)
    return { accessToken, refreshToken }
  }
}
