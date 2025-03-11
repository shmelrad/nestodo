import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if workspace exists and belongs to user
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: createBoardDto.workspaceId,
        userId: user.id,
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

  async findOne(id: number, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const board = await this.prisma.board.findFirst({
      where: {
        id,
        workspace: {
          userId: user.id,
        },
      },
      include: {
        taskLists: {
          include: {
            tasks: true,
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
    await this.findOne(id, userId);

    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
      include: {
        taskLists: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.board.delete({
      where: { id },
    });
  }
}
