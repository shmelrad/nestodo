import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(file: Express.Multer.File, taskId: number) {
    if (!file.originalname) {
      throw new BadRequestException('File name is required')
    }

    const attachment = await this.prisma.attachment.create({
      data: {
        originalFileName: file.originalname,
        fileName: file.filename,
        size: file.size,
        contentType: file.mimetype,
        taskId,
      },
    })

    return attachment
  }

  async findOne(id: number, userId: number) {
    await this.checkAttachmentAccess(id, userId)

    return this.prisma.attachment.findUnique({
      where: { id },
    })
  }

  async remove(id: number, userId: number) {
    await this.checkAttachmentAccess(id, userId)

    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    })

    if (!attachment) {
      return null
    }

    try {
      const filepath = this.getFilePath(attachment.fileName)
      await fs.unlink(filepath)
    } catch (error) {
      throw new Error('File not found')
    }

    return this.prisma.attachment.delete({
      where: { id },
    })
  }

  async checkAttachmentAccess(id: number, userId: number) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id,
        task: {
          taskList: {
            board: {
              workspace: {
                userId,
              },
            },
          },
        },
      },
      select: { id: true },
    })

    if (!attachment) {
      throw new NotFoundException('Attachment not found')
    }
  }

  getFilePath(fileName: string) {
    return path.join(process.cwd(), 'uploads', fileName)
  }
}
