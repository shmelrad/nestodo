import { Module } from '@nestjs/common'
import { TagsService } from './tags.service'
import { TagsController } from './tags.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { WorkspacesModule } from '../workspaces/workspaces.module'

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
