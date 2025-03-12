import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class TaskListsService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) { }

  async create(createTaskListDto: CreateTaskListDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if board exists and belongs to user
    const board = await this.prisma.board.findFirst({
      where: {
        id: createTaskListDto.boardId,
        workspace: {
          userId: user.id,
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return this.prisma.taskList.create({
      data: createTaskListDto,
      include: {
        tasks: true,
      },
    });
  }

  async update(id: number, updateTaskListDto: UpdateTaskListDto, userId: number) {
    await this.validateUserAccess(id, userId);

    return this.prisma.taskList.update({
      where: { id },
      data: updateTaskListDto,
      include: {
        tasks: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.validateUserAccess(id, userId);

    return this.prisma.taskList.delete({
      where: { id },
    });
  }

  private async validateUserAccess(taskListId: number, userId: number) {
    const taskList = await this.prisma.taskList.findFirst({
      where: {
        id: taskListId,
        board: {
          workspace: {
            userId,
          },
        },
      },
    });

    if (!taskList) {
      throw new NotFoundException('Task list not found');
    }

    return taskList;
  }
}
