import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  async create(createSubtaskDto: CreateSubtaskDto, userId: number) {
    await this.checkTaskAccess(createSubtaskDto.taskId, userId);

    return this.prisma.subtask.create({
      data: createSubtaskDto,
    });
  }

  async findOne(id: number, userId: number) {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!id) {
      throw new NotFoundException('Subtask not found');
    }
    
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id,
        task: {
          taskList: {
            board: {
              workspace: {
                userId,
              },
            },
          },
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    return subtask;
  }

  async update(id: number, updateSubtaskDto: UpdateSubtaskDto, userId: number) {
    await this.checkSubtaskAccess(id, userId);

    return this.prisma.subtask.update({
      where: { id },
      data: updateSubtaskDto,
    });
  }

  async remove(id: number, userId: number) {
    await this.checkSubtaskAccess(id, userId);

    return this.prisma.subtask.delete({
      where: { id },
    });
  }

  private async checkTaskAccess(taskId: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        taskList: {
          board: {
            workspace: {
              userId,
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
  }

  private async checkSubtaskAccess(id: number, userId: number) {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!id) {
      throw new NotFoundException('Subtask not found');
    }

    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id,
        task: {
          taskList: {
            board: {
              workspace: {
                userId,
              },
            },
          },
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }
  }
}
