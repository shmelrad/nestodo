import { create } from 'zustand'

interface WorkspaceState {
  selectedWorkspaceId?: number
  setSelectedWorkspaceId: (workspaceId: number) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => {
  const selectedWorkspaceId = localStorage.getItem('selectedWorkspaceId')
  return {
    selectedWorkspaceId: selectedWorkspaceId ? parseInt(selectedWorkspaceId) : undefined,
    setSelectedWorkspaceId: (workspaceId) => {
      set({ selectedWorkspaceId: workspaceId })
      localStorage.setItem('selectedWorkspaceId', workspaceId.toString())
    },
  }
})

