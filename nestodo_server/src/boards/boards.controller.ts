import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ReorderTaskListsDto } from './dto/reorder-task-lists.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    return this.boardsService.create(createBoardDto, +req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.boardsService.findOne(+id, +req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto, @Request() req) {
    return this.boardsService.update(+id, updateBoardDto, +req.user.sub);
  }

  @Patch(':id/reorder-task-lists')
  reorderTaskLists(
    @Param('id') id: string, 
    @Body() reorderTaskListsDto: ReorderTaskListsDto, 
    @Request() req
  ) {
    return this.boardsService.reorderTaskLists(+id, reorderTaskListsDto, +req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.boardsService.remove(+id, +req.user.sub);
  }
}
