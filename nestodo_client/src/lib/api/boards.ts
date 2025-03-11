import { BaseApi } from './base'
import { Board } from '@/types/board'

export interface CreateBoardRequestDto {
  title: string
  workspaceId: number
}

export interface UpdateBoardRequestDto {
  title: string
}

class BoardsApi extends BaseApi {
  constructor() {
    super('/api/boards')
  }

  createBoard(workspaceId: number, data: { title: string }): Promise<Board> {
    return this.post<Board>('/', { ...data, workspaceId }, { auth: true })
  }

  getBoard(id: number): Promise<Board> {
    return this.get<Board>(`/${id}`, { auth: true })
  }

  updateBoard(id: number, data: UpdateBoardRequestDto): Promise<Board> {
    return this.patch<Board>(`/${id}`, data, { auth: true })
  }

  deleteBoard(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }
}

export const boardsApi = new BoardsApi()