import { BaseApi } from './base'
import { Subtask } from '@/types/task'

interface CreateSubtaskRequestDto {
  title: string
  taskId: number
}

interface UpdateSubtaskRequestDto {
  title?: string
  completed?: boolean
}

class SubtasksApi extends BaseApi {
  constructor() {
    super('/api/subtasks')
  }

  createSubtask(data: CreateSubtaskRequestDto): Promise<Subtask> {
    return this.post<Subtask>('/', data, { auth: true })
  }

  updateSubtask(id: number, data: UpdateSubtaskRequestDto): Promise<Subtask> {
    return this.patch<Subtask>(`/${id}`, data, { auth: true })
  }

  deleteSubtask(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }
}

export const subtasksApi = new SubtasksApi()
