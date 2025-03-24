import { z } from 'zod'
import { workspacesApi } from '@/lib/api/workspaces'
import { FormDialog } from '@/components/ui/form-dialog'

const editWorkspaceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

type EditWorkspaceSchema = z.infer<typeof editWorkspaceSchema>

interface EditWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: number
  currentTitle: string
}

export default function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspaceId,
  currentTitle,
}: EditWorkspaceDialogProps) {
  return (
    <FormDialog<EditWorkspaceSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Edit workspace"
      description="Change the name of your workspace"
      schema={editWorkspaceSchema}
      defaultValues={{ title: currentTitle }}
      onSubmit={(data) => workspacesApi.updateWorkspace(workspaceId, data)}
      invalidateQueryKeys={[['workspaces']]}
      submitButtonText="Save changes"
      pendingButtonText="Saving..."
      successMessage="Workspace updated successfully"
      errorMessage="Failed to update workspace"
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
