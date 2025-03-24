import { BaseApi } from './base'

class TagsApi extends BaseApi {
  constructor() {
    super('/api/tags')
  }

  getWorkspaceTags(workspaceId: number): Promise<string[]> {
    return this.get<string[]>(`/workspace/${workspaceId}`, { auth: true })
  }

  searchWorkspaceTags(workspaceId: number, query: string): Promise<string[]> {
    return this.get<string[]>(`/workspace/${workspaceId}/search`, {
      auth: true,
      params: { query },
    })
  }

  createWorkspaceTag(workspaceId: number, tag: string): Promise<void> {
    return this.post<void>(`/workspace/${workspaceId}`, { tag }, { auth: true })
  }

  deleteWorkspaceTag(workspaceId: number, tagName: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/workspace/${workspaceId}/${encodeURIComponent(tagName)}`, {
      auth: true,
    })
  }
}

export const tagsApi = new TagsApi()
