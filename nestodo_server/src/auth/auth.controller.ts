import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterRequestDto } from './dtos/register-request.dto'
import { LoginResponseDTO } from './dtos/login-response.dto'
import { RegisterResponseDTO } from './dtos/register-response.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { ConfigService } from '@nestjs/config'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { CookieOptions } from 'express'

@Controller('auth')
export class AuthController {
  private refreshTokenCookieOptions: CookieOptions  

  constructor(private authService: AuthService, private configService: ConfigService) {
    const refreshTokenMaxAgeHours = this.configService.get('REFRESH_TOKEN_COOKIE_MAX_AGE_HOURS')

    if (!refreshTokenMaxAgeHours) {
      throw new Error('REFRESH_TOKEN_COOKIE_MAX_AGE_HOURS is not set')
    }

    this.refreshTokenCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      maxAge: refreshTokenMaxAgeHours * 60 * 60 * 1000,
    }
  }
  
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res): Promise<LoginResponseDTO | BadRequestException> {
    const { accessToken, refreshToken } = await this.authService.login(req.user)
    res.cookie('refreshToken', refreshToken, this.refreshTokenCookieOptions)

    return { accessToken }
  }

  @Post('register')
  async register(
    @Body() registerBody: RegisterRequestDto,
    @Res({ passthrough: true }) res
  ): Promise<RegisterResponseDTO | BadRequestException> {
    const { accessToken, refreshToken } = await this.authService.register(registerBody)
    res.cookie('refreshToken', refreshToken, this.refreshTokenCookieOptions)

    return { accessToken }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(req.user)
    res.cookie('refreshToken', refreshToken, this.refreshTokenCookieOptions)

    return { accessToken }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    await this.authService.blacklistToken(req.cookies.refreshToken);
    res.clearCookie('refreshToken');

    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
