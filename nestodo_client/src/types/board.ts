import { TaskList } from './taskList'

export interface Board {
  id: number
  title: string
  taskLists: TaskList[]
  workspaceId: number
  createdAt: Date
  updatedAt: Date
}
