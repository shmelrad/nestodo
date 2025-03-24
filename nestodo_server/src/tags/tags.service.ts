import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '@/workspaces/workspaces.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService, private workspaceService: WorkspacesService) { }

    async getWorkspaceTags(workspaceId: number, userId: number): Promise<string[]> {
        await this.workspaceService.checkWorkspaceAccess(workspaceId, userId);

        const tags = await this.prisma.workspaceTag.findMany({
            where: {
                workspaceId,
            },
            select: {
                name: true,
            },
        });

        return tags.map(tag => tag.name);
    }

    async searchWorkspaceTags(
        workspaceId: number,
        query: string,
        userId: number,
    ): Promise<string[]> {
        await this.workspaceService.checkWorkspaceAccess(workspaceId, userId);

        const lowerQuery = query.toLowerCase();
        
        const tags = await this.prisma.workspaceTag.findMany({
            where: {
                workspaceId,
                name: {
                    contains: lowerQuery,
                    mode: 'insensitive', // Case insensitive search
                },
            },
            select: {
                name: true,
            },
        });

        return tags.map(tag => tag.name);
    }

    async createWorkspaceTag(
        workspaceId: number,
        tag: string,
        userId: number,
    ) {
        await this.workspaceService.checkWorkspaceAccess(workspaceId, userId);

        await this.prisma.workspaceTag.upsert({
            where: {
                workspaceId_name: {
                    workspaceId,
                    name: tag,
                },
            },
            update: {},
            create: {
                name: tag,
                workspaceId,
            },
        });
    }

    async deleteWorkspaceTag(
        workspaceId: number,
        tagName: string,
        userId: number,
    ) {
        await this.workspaceService.checkWorkspaceAccess(workspaceId, userId);

        const tag = await this.prisma.workspaceTag.findUnique({
            where: {
                workspaceId_name: {
                    workspaceId,
                    name: tagName,
                },
            },
        });

        if (!tag) {
            throw new NotFoundException(`Tag not found`);
        }

        await this.prisma.workspaceTag.delete({
            where: {
                id: tag.id,
            },
        });

        return { success: true };
    }
} 