import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST')
        const portString = configService.get('REDIS_PORT')

        if (!host || !portString) {
          throw new Error('Redis host and port must be set')
        }
        const port = parseInt(portString)

        if (isNaN(port)) {
          throw new Error('Redis port must be a number')
        }

        return new Redis({
          host,
          port,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}