import { Module } from '@nestjs/common'
import { BoardsService } from './boards.service'
import { BoardsController } from './boards.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
