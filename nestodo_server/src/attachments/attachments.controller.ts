import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Res,
  UseGuards,
  StreamableFile,
  Req,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AttachmentsService } from './attachments.service'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import * as fs from 'fs'

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload/:taskId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Req() req,
  ) {
    return this.attachmentsService.create(file, taskId, +req.user.sub)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attachmentsService.findOne(id, +req.user.sub)
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    const attachment = await this.attachmentsService.findOne(id, +req.user.sub)
    if (!attachment) {
      return res.status(404).send('File not found')
    }

    res.set({
      'Content-Type': attachment.contentType,
      'Content-Disposition': `attachment; filename="${attachment.originalFileName}"`,
    })

    const filePath = this.attachmentsService.getFilePath(attachment.fileName)
    const readStream = fs.createReadStream(filePath)
    return new StreamableFile(readStream)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attachmentsService.remove(id, +req.user.sub)
  }
}
