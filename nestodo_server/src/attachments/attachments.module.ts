import { Module } from '@nestjs/common'
import { AttachmentsController } from './attachments.controller'
import { AttachmentsService } from './attachments.service'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import * as crypto from 'crypto'
import * as fs from 'fs'
import { PrismaModule } from '@/prisma/prisma.module'
import { TasksModule } from '@/tasks/tasks.module'
import { UPLOADS_FOLDER_PATH } from './atachments.constants'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(UPLOADS_FOLDER_PATH)) {
            fs.mkdirSync(UPLOADS_FOLDER_PATH, { recursive: true })
          }
          cb(null, UPLOADS_FOLDER_PATH)
        },
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(32).toString('hex')
          const fileExtension = extname(file.originalname)
          cb(null, `${randomName}${fileExtension}`)
        },
      }),
    }),
    PrismaModule,
    TasksModule,
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}
