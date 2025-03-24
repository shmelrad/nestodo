import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { TaskListsService } from './task-lists.service'
import { CreateTaskListDto } from './dto/create-task-list.dto'
import { UpdateTaskListDto } from './dto/update-task-list.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GetUserId } from '@/auth/decorators/get-user-id.decorator'
@UseGuards(JwtAuthGuard)
@Controller('task-lists')
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) {}

  @Post()
  create(@Body() createTaskListDto: CreateTaskListDto, @GetUserId() userId: number) {
    return this.taskListsService.create(createTaskListDto, userId)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskListDto: UpdateTaskListDto, @GetUserId() userId: number) {
    return this.taskListsService.update(+id, updateTaskListDto, userId)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.taskListsService.remove(+id, userId)
  }
}
