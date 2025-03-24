import { Board } from './board'

export interface Workspace {
  id: number
  title: string
  boards: Board[]
  createdAt: string
  updatedAt: string
}
