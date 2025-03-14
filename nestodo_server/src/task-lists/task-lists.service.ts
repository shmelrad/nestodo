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
      include: {
        taskLists: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Get the highest position value to place the new task list at the end
    const maxPosition = board.taskLists.length > 0
      ? Math.max(...board.taskLists.map(list => list.position))
      : -1;

    return this.prisma.taskList.create({
      data: {
        ...createTaskListDto,
        position: maxPosition + 1,
      },
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
    const taskList = await this.validateUserAccess(id, userId);

    // Delete the task list
    await this.prisma.taskList.delete({
      where: { id },
    });

    // Reorder the remaining task lists to maintain sequential positions
    const remainingTaskLists = await this.prisma.taskList.findMany({
      where: {
        boardId: taskList.boardId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    const updates = remainingTaskLists.map((list, index) => {
      return this.prisma.taskList.update({
        where: { id: list.id },
        data: { position: index },
      });
    });

    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    return { success: true };
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
