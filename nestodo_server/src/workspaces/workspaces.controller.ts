import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUserId } from '@/auth/decorators/get-user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @GetUserId() userId: number) {
    return this.workspacesService.create(createWorkspaceDto, userId);
  }

  @Get()
  findAll(@GetUserId() userId: number) {
    return this.workspacesService.findAll(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @GetUserId() userId: number) {
    return this.workspacesService.update(+id, updateWorkspaceDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.workspacesService.remove(+id, userId);
  }
}
