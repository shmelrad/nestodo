import { BaseApi } from './base'
import { Task } from '@/types/task'

interface CreateTaskRequestDto {
  title: string
  taskListId: number
}

class TasksApi extends BaseApi {
  constructor() {
    super('/api/tasks')
  }

  createTask(data: CreateTaskRequestDto): Promise<Task> {
    return this.post<Task>('/', data, { auth: true })
  }

  updateTask(id: number, data: { title: string }): Promise<Task> {
    return this.patch<Task>(`/${id}`, data, { auth: true })
  }

  deleteTaskList(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }
}

export const tasksApi = new TasksApi()
