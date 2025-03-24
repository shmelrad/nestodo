import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CreateTaskListDto } from './dto/create-task-list.dto'
import { UpdateTaskListDto } from './dto/update-task-list.dto'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class TaskListsService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskListDto: CreateTaskListDto, userId: number) {
    // Check if board exists and belongs to user
    const board = await this.prisma.board.findFirst({
      where: {
        id: createTaskListDto.boardId,
        workspace: {
          userId: userId,
        },
      },
      include: {
        taskLists: true,
      },
    })

    if (!board) {
      throw new NotFoundException('Board not found')
    }

    // Get the highest position value to place the new task list at the end
    const maxPosition =
      board.taskLists.length > 0 ? Math.max(...board.taskLists.map((list) => list.position)) : -1

    return this.prisma.taskList.create({
      data: {
        ...createTaskListDto,
        position: maxPosition + 1,
      },
      include: {
        tasks: true,
      },
    })
  }

  async update(id: number, updateTaskListDto: UpdateTaskListDto, userId: number) {
    await this.checkTaskListAccess(id, userId)

    return this.prisma.taskList.update({
      where: { id },
      data: updateTaskListDto,
      include: {
        tasks: true,
      },
    })
  }

  async remove(id: number, userId: number) {
    const taskList = await this.findOne(id, userId)

    await this.prisma.taskList.delete({
      where: { id },
    })

    // Reorder the remaining task lists
    const remainingTaskLists = await this.prisma.taskList.findMany({
      where: {
        boardId: taskList.boardId,
      },
      orderBy: {
        position: 'asc',
      },
    })

    const updates = remainingTaskLists.map((list, index) => {
      return this.prisma.taskList.update({
        where: { id: list.id },
        data: { position: index },
      })
    })

    if (updates.length > 0) {
      await this.prisma.$transaction(updates)
    }

    return { success: true }
  }

  async findOne(id: number, userId: number) {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated')
    }

    if (!id) {
      throw new NotFoundException('Task list not found')
    }

    const taskList = await this.prisma.taskList.findFirst({
      where: {
        id,
        board: {
          workspace: {
            userId: userId,
          },
        },
      },
      include: {
        tasks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    })

    if (!taskList) {
      throw new NotFoundException('Task list not found')
    }

    return taskList
  }

  async checkTaskListAccess(id: number, userId: number) {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated')
    }

    if (!id) {
      throw new NotFoundException('Task list not found')
    }

    const taskList = await this.prisma.taskList.findFirst({
      where: {
        id,
        board: {
          workspace: {
            userId,
          },
        },
      },
      select: { id: true },
    })

    if (!taskList) {
      throw new NotFoundException('Task list not found')
    }
  }
}
