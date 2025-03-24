import { z } from 'zod'
import { workspacesApi } from '@/lib/api/workspaces'
import { FormDialog } from '@/components/ui/form-dialog'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useMutation } from '@tanstack/react-query'
import { Workspace } from '@/types/workspace'

const createWorkspaceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const setSelectedWorkspaceId = useWorkspaceStore((state) => state.setSelectedWorkspaceId)

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: CreateWorkspaceSchema) => workspacesApi.createWorkspace(data),
    onSuccess: (workspace: Workspace) => {
      setSelectedWorkspaceId(workspace.id)
    },
  })

  return (
    <FormDialog<CreateWorkspaceSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Create new workspace"
      description="Add a new workspace to organize your tasks"
      schema={createWorkspaceSchema}
      defaultValues={{ title: '' }}
      onSubmit={(data) => createWorkspaceMutation.mutateAsync(data)}
      invalidateQueryKeys={[['workspaces']]}
      submitButtonText="Create workspace"
      pendingButtonText="Creating..."
      successMessage="Workspace created successfully"
      errorMessage="Failed to create workspace"
      fields={[
        {
          name: 'title',
          label: 'Title',
          placeholder: 'My Workspace',
        },
      ]}
    />
  )
}
