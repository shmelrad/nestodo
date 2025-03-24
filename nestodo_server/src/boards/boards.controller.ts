import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ReorderTaskListsDto } from './dto/reorder-task-lists.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUserId } from '@/auth/decorators/get-user-id.decorator';
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @GetUserId() userId: number) {
    return this.boardsService.create(createBoardDto, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.boardsService.findOne(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto, @GetUserId() userId: number) {
    return this.boardsService.update(+id, updateBoardDto, userId);
  }

  @Patch(':id/reorder-task-lists')
  reorderTaskLists(
    @Param('id') id: string,
    @Body() reorderTaskListsDto: ReorderTaskListsDto,
    @GetUserId() userId: number
  ) {
    return this.boardsService.reorderTaskLists(+id, reorderTaskListsDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.boardsService.remove(+id, userId);
  }
}
