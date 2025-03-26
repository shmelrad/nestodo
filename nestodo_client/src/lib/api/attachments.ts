import { BaseApi } from './base'
import { Attachment } from '@/types/attachment'

class AttachmentsApi extends BaseApi {
  constructor() {
    super('/api/attachments')
  }

  async uploadFile(file: File, taskId: number): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.postFile<Attachment>(`/upload/${taskId}`, formData, {
      auth: true,
    })
  }

  async deleteAttachment(id: number) {
    return this.delete<void>(`/${id}`, { auth: true })
  }

  async getAttachmentBlob(id: number): Promise<Blob> {
    return this.getFileBlob(`/download/${id}`, { auth: true })
  }

  async getAttachment(id: number): Promise<Attachment> {
    return this.get<Attachment>(`/${id}`, { auth: true })
  }

  async downloadAttachment(id: number) {
    try {
      const blob = await this.getFileBlob(`/download/${id}`, { auth: true })

      const attachment = await this.getAttachment(id)
      const filename = attachment.originalFileName

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = filename

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }
}

export const attachmentsApi = new AttachmentsApi()
