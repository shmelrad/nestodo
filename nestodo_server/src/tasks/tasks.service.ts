import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}

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
      include: {
        tasks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!taskList) {
      throw new NotFoundException('Task list not found');
    }

    // Get the highest position value to place the new task at the end
    const maxPosition = taskList.tasks.length > 0
      ? Math.max(...taskList.tasks.map(task => task.position))
      : -1;

    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        position: maxPosition + 1,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id, taskList: { board: { workspace: { userId: user.id } } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async moveTask(id: number, moveTaskDto: MoveTaskDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify the task exists and belongs to the user
    const task = await this.prisma.task.findUnique({
      where: { 
        id, 
        taskList: { 
          id: moveTaskDto.sourceTaskListId,
          board: { 
            workspace: { 
              userId: user.id 
            } 
          } 
        } 
      },
      include: {
        taskList: true
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found or does not belong to the specified source list');
    }

    // Verify the destination task list exists and belongs to the user
    const destinationTaskList = await this.prisma.taskList.findUnique({
      where: {
        id: moveTaskDto.destinationTaskListId,
        board: {
          workspace: {
            userId: user.id,
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
    });

    if (!destinationTaskList) {
      throw new NotFoundException('Destination task list not found');
    }

    // Verify both task lists belong to the same board
    if (task.taskList.boardId !== destinationTaskList.boardId) {
      throw new BadRequestException('Cannot move tasks between different boards');
    }

    // Validate the new position
    if (moveTaskDto.newPosition < 0 || moveTaskDto.newPosition > destinationTaskList.tasks.length) {
      throw new BadRequestException('Invalid position');
    }

    // Start a transaction to handle all the position updates
    return this.prisma.$transaction(async (prisma) => {
      // If moving within the same list
      if (moveTaskDto.sourceTaskListId === moveTaskDto.destinationTaskListId) {
        // Get all tasks in the list
        const tasksInList = await prisma.task.findMany({
          where: {
            taskListId: moveTaskDto.sourceTaskListId,
          },
          orderBy: {
            position: 'asc',
          },
        });

        // Find the current position of the task
        const currentPosition = tasksInList.findIndex(t => t.id === id);
        
        // Update positions of all affected tasks
        if (currentPosition < moveTaskDto.newPosition) {
          // Moving down: shift tasks between old and new positions up
          for (let i = currentPosition + 1; i <= moveTaskDto.newPosition; i++) {
            await prisma.task.update({
              where: { id: tasksInList[i].id },
              data: { position: i - 1 },
            });
          }
        } else if (currentPosition > moveTaskDto.newPosition) {
          // Moving up: shift tasks between new and old positions down
          for (let i = moveTaskDto.newPosition; i < currentPosition; i++) {
            await prisma.task.update({
              where: { id: tasksInList[i].id },
              data: { position: i + 1 },
            });
          }
        }

        // Update the moved task's position
        return prisma.task.update({
          where: { id },
          data: { position: moveTaskDto.newPosition },
        });
      } else {
        // Moving between different lists
        
        // 1. Update positions in the source list
        const tasksInSourceList = await prisma.task.findMany({
          where: {
            taskListId: moveTaskDto.sourceTaskListId,
          },
          orderBy: {
            position: 'asc',
          },
        });

        const currentPosition = tasksInSourceList.findIndex(t => t.id === id);
        
        // Shift tasks after the moved task up
        for (let i = currentPosition + 1; i < tasksInSourceList.length; i++) {
          await prisma.task.update({
            where: { id: tasksInSourceList[i].id },
            data: { position: i - 1 },
          });
        }

        // 2. Update positions in the destination list
        const tasksInDestList = await prisma.task.findMany({
          where: {
            taskListId: moveTaskDto.destinationTaskListId,
          },
          orderBy: {
            position: 'asc',
          },
        });

        // Shift tasks at and after the insertion point down
        for (let i = moveTaskDto.newPosition; i < tasksInDestList.length; i++) {
          await prisma.task.update({
            where: { id: tasksInDestList[i].id },
            data: { position: i + 1 },
          });
        }

        // 3. Move the task to the destination list with the new position
        return prisma.task.update({
          where: { id },
          data: { 
            taskListId: moveTaskDto.destinationTaskListId,
            position: moveTaskDto.newPosition,
          },
        });
      }
    });
  }

  async remove(id: number, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id, taskList: { board: { workspace: { userId: user.id } } } },
      include: {
        taskList: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Delete the task
    await this.prisma.task.delete({
      where: { id },
    });

    // Reorder the remaining tasks to maintain sequential positions
    const remainingTasks = await this.prisma.task.findMany({
      where: {
        taskListId: task.taskListId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    const updates = remainingTasks.map((t, index) => {
      return this.prisma.task.update({
        where: { id: t.id },
        data: { position: index },
      });
    });

    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    return { success: true };
  }
}
