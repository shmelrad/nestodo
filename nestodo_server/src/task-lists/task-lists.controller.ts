import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TaskListsService } from './task-lists.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('task-lists')
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) { }

  @Post()
  create(@Body() createTaskListDto: CreateTaskListDto, @Request() req) {
    return this.taskListsService.create(createTaskListDto, +req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskListDto: UpdateTaskListDto, @Request() req) {
    return this.taskListsService.update(+id, updateTaskListDto, +req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.taskListsService.remove(+id, +req.user.sub);
  }
}
