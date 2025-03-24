import { Attachment } from "./attachment"
import { TaskList } from "./taskList"
import { WorkspaceTag } from "./workspaceTag"

export interface Task {
    id: number
    title: string
    description: string | null
    priority: TaskPriority | null
    completed: boolean
    duration: number | null
    attachments: Attachment[]
    subtasks: Subtask[]
    taskList: TaskList
    taskListId: number
    createdAt: string
    updatedAt: string
    position: number
    tags: WorkspaceTag[]
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


