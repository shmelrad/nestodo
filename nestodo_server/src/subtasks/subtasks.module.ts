import { Module } from '@nestjs/common'
import { SubtasksService } from './subtasks.service'
import { SubtasksController } from './subtasks.controller'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [SubtasksController],
  providers: [SubtasksService],
})
export class SubtasksModule {}
