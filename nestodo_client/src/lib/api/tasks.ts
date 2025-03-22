import { Attachment } from '@/types/attachment'
import { BaseApi } from './base'
import { Subtask, Task, TaskPriority } from '@/types/task'

interface CreateTaskRequestDto {
  title: string
  taskListId: number
}

interface UpdateTaskRequestDto {
  title?: string
  description?: string
  completed?: boolean
  subtasks?: Subtask[]
  priority?: TaskPriority
  attachments?: Attachment[]
}

interface MoveTaskRequestDto {
  sourceTaskListId: number
  destinationTaskListId: number
  newPosition: number
}

class TasksApi extends BaseApi {
  constructor() {
    super('/api/tasks')
  }

  createTask(data: CreateTaskRequestDto): Promise<Task> {
    return this.post<Task>('/', data, { auth: true })
  }

  updateTask(id: number, data: UpdateTaskRequestDto): Promise<Task> {
    return this.patch<Task>(`/${id}`, data, { auth: true })
  }

  deleteTask(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }

  moveTask(id: number, data: MoveTaskRequestDto): Promise<Task> {
    return this.patch<Task>(`/${id}/move`, data, { auth: true })
  }
}

export const tasksApi = new TasksApi()
