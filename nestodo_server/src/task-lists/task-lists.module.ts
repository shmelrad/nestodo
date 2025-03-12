import { Module } from '@nestjs/common';
import { TaskListsService } from './task-lists.service';
import { TaskListsController } from './task-lists.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [TaskListsController],
  providers: [TaskListsService],
})
export class TaskListsModule { }
