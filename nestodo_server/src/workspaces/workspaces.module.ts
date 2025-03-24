import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { UsersModule } from '@/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
