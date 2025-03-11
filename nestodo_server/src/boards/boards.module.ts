import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule { }
