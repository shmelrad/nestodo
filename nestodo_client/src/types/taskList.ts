import { Task } from "./task"

export interface TaskList {
    id: number
    title: string
    tasks: Task[]
    boardId: number
}
