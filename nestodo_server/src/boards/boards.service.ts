import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ReorderTaskListsDto } from './dto/reorder-task-lists.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: number) {
    // Check if workspace exists and belongs to user
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: createBoardDto.workspaceId,
        userId: userId,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.prisma.board.create({
      data: createBoardDto,
      include: {
        taskLists: true,
      },
    });
  }

  async checkBoardAccess(id: number, userId: number) {
    const board = await this.prisma.board.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
      select: { id: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }
  }

  async findOne(id: number, userId: number) {
    const board = await this.prisma.board.findFirst({
      where: {
        id,
        workspace: {
          userId: userId,
        },
      },
      include: {
        taskLists: {
          orderBy: {
            position: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                subtasks: {
                  orderBy: {
                    id: 'asc',
                  },
                },
                attachments: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto, userId: number) {
    await this.checkBoardAccess(id, userId);

    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
      include: {
        taskLists: true,
      },
    });
  }

  async reorderTaskLists(id: number, reorderTaskListsDto: ReorderTaskListsDto, userId: number) {
    const board = await this.findOne(id, userId);
    
    // Verify all task list IDs belong to this board
    const boardTaskListIds = board.taskLists.map(list => list.id);
    const allTaskListsBelongToBoard = reorderTaskListsDto.taskListIds.every(
      id => boardTaskListIds.includes(id)
    );
    
    if (!allTaskListsBelongToBoard) {
      throw new BadRequestException('One or more task lists do not belong to this board');
    }
    
    // Verify all task lists from the board are included
    if (reorderTaskListsDto.taskListIds.length !== boardTaskListIds.length) {
      throw new BadRequestException('The reordering must include all task lists from the board');
    }

    // Update each task list with its new position
    const updates = reorderTaskListsDto.taskListIds.map((taskListId, index) => {
      return this.prisma.taskList.update({
        where: { id: taskListId },
        data: { position: index },
      });
    });

    await this.prisma.$transaction(updates);

    // Return the updated board
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    await this.checkBoardAccess(id, userId);

    return this.prisma.board.delete({
      where: { id },
    });
  }
}
