import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { SubtasksService } from './subtasks.service'
import { CreateSubtaskDto } from './dto/create-subtask.dto'
import { UpdateSubtaskDto } from './dto/update-subtask.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GetUserId } from '@/auth/decorators/get-user-id.decorator'

@UseGuards(JwtAuthGuard)
@Controller('subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  create(@Body() createSubtaskDto: CreateSubtaskDto, @GetUserId() userId: number) {
    return this.subtasksService.create(createSubtaskDto, userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.subtasksService.findOne(+id, userId)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubtaskDto: UpdateSubtaskDto, @GetUserId() userId: number) {
    return this.subtasksService.update(+id, updateSubtaskDto, userId)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.subtasksService.remove(+id, userId)
  }
}
