import { Controller, Get, Post, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Get('workspace/:workspaceId')
    getWorkspaceTags(
        @Param('workspaceId') workspaceId: string,
        @GetUserId() userId: number,
    ) {
        return this.tagsService.getWorkspaceTags(+workspaceId, userId);
    }

    @Get('workspace/:workspaceId/search')
    searchWorkspaceTags(
        @Param('workspaceId') workspaceId: string,
        @Query('query') query: string,
        @GetUserId() userId: number,
    ) {
        return this.tagsService.searchWorkspaceTags(+workspaceId, query, userId);
    }

    @Post('workspace/:workspaceId')
    createWorkspaceTag(
        @Param('workspaceId') workspaceId: string,
        @Body() createTagDto: CreateTagDto,
        @GetUserId() userId: number,
    ) {
        return this.tagsService.createWorkspaceTag(+workspaceId, createTagDto.tag, userId);
    }
    
    @Delete('workspace/:workspaceId/:tagName')
    deleteWorkspaceTag(
        @Param('workspaceId') workspaceId: string,
        @Param('tagName') tagName: string,
        @GetUserId() userId: number,
    ) {
        return this.tagsService.deleteWorkspaceTag(+workspaceId, tagName, userId);
    }
} 