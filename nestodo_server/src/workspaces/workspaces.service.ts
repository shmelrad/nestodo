import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService, private userService: UsersService) { }

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        ...createWorkspaceDto,
      },
    });

    return workspace;
  }

  async findAll(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.workspace.findMany({ where: { userId: user.id }, include: { boards: true } });
  }

  async findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  async remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
