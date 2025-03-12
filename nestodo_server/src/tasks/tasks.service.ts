import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private userService: UsersService) { }

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const taskList = await this.prisma.taskList.findUnique({
      where: {
        id: createTaskDto.taskListId,
        board: {
          workspace: {
            userId: user.id,
          },
        },
      },
    });

    if (!taskList) {
      throw new NotFoundException('Task list not found');
    }

    return this.prisma.task.create({
      data: createTaskDto,
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id, taskList: { board: { workspace: { userId: user.id } } } },
      // include: {
      //   taskList: {
      //     include: {
      //       board: {
      //         include: {
      //           workspace: true,
      //         },
      //       },
      //     },
      //   },
      // },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id, taskList: { board: { workspace: { userId: user.id } } } },
      // include: {
      //   taskList: {
      //     include: {
      // board: {
      //   include: {
      //     workspace: true,
      //   },
      //     },
      //   },
      // },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
