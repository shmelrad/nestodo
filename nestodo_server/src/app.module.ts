import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    WorkspacesModule, BoardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
