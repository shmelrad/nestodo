import { Attachment } from "./attachment"
import { TaskList } from "./taskList"

export interface Task {
    id: number
    title: string
    description: string | null
    priority: TaskPriority | null
    completed: boolean
    attachments: Attachment[]
    subtasks: Subtask[]
    taskList: TaskList
    taskListId: number
    createdAt: Date
    updatedAt: Date
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export interface Subtask {
    id: number
    title: string
    completed: boolean
    taskId: number
}


