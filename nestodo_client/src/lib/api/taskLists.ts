import { BaseApi } from './base'
import { TaskList } from '@/types/taskList'

interface CreateTaskListRequestDto {
  title: string
  boardId: number
}

class TaskListsApi extends BaseApi {
  constructor() {
    super('/api/task-lists')
  }

  createTaskList(data: CreateTaskListRequestDto): Promise<TaskList> {
    return this.post<TaskList>('/', data, { auth: true })
  }

  updateTaskList(id: number, data: { title: string }): Promise<TaskList> {
    return this.patch<TaskList>(`/${id}`, data, { auth: true })
  }

  deleteTaskList(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }
}

export const taskListsApi = new TaskListsApi()
