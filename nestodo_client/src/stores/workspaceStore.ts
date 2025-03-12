import { create } from 'zustand'

interface WorkspaceState {
  selectedWorkspaceId?: number
  selectedBoardIds: Record<number, number>
  getSelectedBoardId: (workspaceId: number) => number | undefined
  setSelectedWorkspaceId: (workspaceId: number) => void
  setSelectedBoardId: (workspaceId: number, boardId: number) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  const selectedWorkspaceId = localStorage.getItem('selectedWorkspaceId')
  const selectedBoardIds = JSON.parse(localStorage.getItem('selectedBoardIds') || '{}')
  
  const normalizedBoardIds: Record<number, number> = {}
  Object.entries(selectedBoardIds).forEach(([key, value]) => {
    normalizedBoardIds[Number(key)] = Number(value)
  })
  
  return {
    selectedWorkspaceId: selectedWorkspaceId ? parseInt(selectedWorkspaceId) : undefined,
    selectedBoardIds: normalizedBoardIds,
    getSelectedBoardId: (workspaceId) => {
      return get().selectedBoardIds[workspaceId]
    },
    setSelectedWorkspaceId: (workspaceId) => {
      set({ selectedWorkspaceId: workspaceId })
      localStorage.setItem('selectedWorkspaceId', workspaceId.toString())
    },
    setSelectedBoardId: (workspaceId, boardId) => {
      set((state) => ({
        selectedBoardIds: {
          ...state.selectedBoardIds,
          [workspaceId]: boardId
        }
      }))
      const updatedBoardIds = {
        ...get().selectedBoardIds,
        [workspaceId]: boardId
      }
      localStorage.setItem('selectedBoardIds', JSON.stringify(updatedBoardIds))
    },
  }
})

