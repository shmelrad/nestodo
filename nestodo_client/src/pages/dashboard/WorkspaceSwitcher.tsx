import { ChevronsUpDown, EllipsisVertical, Pencil, Plus, Trash } from 'lucide-react'
import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Workspace } from '@/types/workspace'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useEffect } from 'react'
import CreateWorkspaceDialog from './dialogs/CreateWorkspaceDialog'
import EditWorkspaceDialog from './dialogs/EditWorkspaceDialog'
import { displayApiError } from '@/lib/utils'
import { ApiError } from '@/lib/api/base'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspacesApi } from '@/lib/api/workspaces'

export type WorkspaceSwitcherProps = {
  workspaces: Workspace[]
  defaultWorkspaceId: number
}

export function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null)
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore((state) => state)
  const queryClient = useQueryClient()

  const deleteWorkspaceMutation = useMutation({
    mutationFn: (workspaceId: number) => workspacesApi.deleteWorkspace(workspaceId),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace deleted successfully')
    },
    onError: (error: ApiError) => {
      displayApiError('Failed to delete workspace', error)
    },
  })

  useEffect(() => {
    if (!selectedWorkspaceId) {
      if (workspaces.length > 0) {
        setSelectedWorkspaceId(workspaces[0].id)
      }
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId])

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)

  const handleDeleteWorkspace = (workspaceId: number) => {
    if (selectedWorkspaceId === workspaceId && workspaces.length > 1) {
      setSelectedWorkspaceId(workspaces[0].id)
    }
    deleteWorkspaceMutation.mutate(workspaceId)
  }

  const editingWorkspace = workspaces.find((workspace) => workspace.id === editingWorkspaceId)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square text-xl size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <p>{selectedWorkspace?.title.charAt(0)}</p>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{selectedWorkspace?.title}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-54 max-w-72 p-3" align="start">
              <p className="text-sm text-muted-foreground cursor-default mb-2">Your workspaces</p>
              {workspaces.map((workspace) => (
                <div className="flex items-center" key={workspace.id}>
                  <DropdownMenuCheckboxItem
                    checked={workspace.id === selectedWorkspaceId}
                    onCheckedChange={() => setSelectedWorkspaceId(workspace.id)}
                    className="flex-1 min-w-0"
                  >
                    <span className="truncate">{workspace.title}</span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisVertical
                        className="hover:text-foreground/50 cursor-pointer"
                        size={18}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setEditingWorkspaceId(workspace.id)}>
                        <Pencil className="mr-2" size={18} />
                        Edit Workspace
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteWorkspace(workspace.id)}>
                        <Trash className="mr-2" size={18} />
                        Delete Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2" />
                Create new workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {editingWorkspace && (
        <EditWorkspaceDialog
          open={editingWorkspaceId !== null}
          onOpenChange={(open) => {
            if (!open) setEditingWorkspaceId(null)
          }}
          workspaceId={editingWorkspace.id}
          currentTitle={editingWorkspace.title}
        />
      )}
    </>
  )
}
