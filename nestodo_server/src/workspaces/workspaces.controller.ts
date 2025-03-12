import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req) {
    return this.workspacesService.create(createWorkspaceDto, +req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.workspacesService.findAll(+req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Request() req) {
    return this.workspacesService.update(+id, updateWorkspaceDto, +req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.workspacesService.remove(+id, +req.user.sub);
  }
}
