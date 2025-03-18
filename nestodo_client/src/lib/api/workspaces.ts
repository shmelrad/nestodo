import { BaseApi } from './base'
import { Workspace } from '@/types/workspace'

interface CreateWorkspaceRequestDto {
  title: string
}

interface UpdateWorkspaceRequestDto {
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

  updateWorkspace(id: number, data: UpdateWorkspaceRequestDto): Promise<Workspace> {
    return this.patch<Workspace>(`/${id}`, data, { auth: true })
  }

  deleteWorkspace(id: number): Promise<void> {
    return this.delete<void>(`/${id}`, { auth: true })
  }
}

export const workspacesApi = new WorkspacesApi() 