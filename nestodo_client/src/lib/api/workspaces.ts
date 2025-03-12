import { BaseApi } from './base'
import { Workspace } from '@/types/workspace'

interface CreateWorkspaceRequestDto {
  title: string
}


class WorkspacesApi extends BaseApi {
  constructor() {
    super('/api/workspaces')
  }

  createWorkspace(data: CreateWorkspaceRequestDto): Promise<Workspace> {
    return this.post<Workspace>('/', data, { auth: true })
  }

  getWorkspaces(): Promise<Workspace[]> {
    return this.get<Workspace[]>('/', { auth: true })
  }

  deleteWorkspace(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }
}

export const workspacesApi = new WorkspacesApi() 