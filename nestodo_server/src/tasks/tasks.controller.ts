import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { MoveTaskDto } from './dto/move-task.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GetUserId } from '@/auth/decorators/get-user-id.decorator'
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @GetUserId() userId: number) {
    return this.tasksService.create(createTaskDto, userId)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUserId() userId: number,
  ) {
    return this.tasksService.update(+id, updateTaskDto, userId)
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @Body() moveTaskDto: MoveTaskDto, @GetUserId() userId: number) {
    return this.tasksService.moveTask(+id, moveTaskDto, userId)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.tasksService.remove(+id, userId)
  }
}
