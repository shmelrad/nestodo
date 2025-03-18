import { z } from "zod"
import { workspacesApi } from "@/lib/api/workspaces"
import { FormDialog } from "@/components/ui/form-dialog"

const createWorkspaceSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  return (
    <FormDialog<CreateWorkspaceSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Create new workspace"
      description="Add a new workspace to organize your tasks"
      schema={createWorkspaceSchema}
      defaultValues={{ title: "" }}
      onSubmit={(data) => workspacesApi.createWorkspace(data)}
      invalidateQueryKeys={[["workspaces"]]}
      submitButtonText="Create workspace"
      pendingButtonText="Creating..."
      successMessage="Workspace created successfully"
      errorMessage="Failed to create workspace"
      fields={[
        {
          name: "title",
          label: "Title",
          placeholder: "My Workspace"
        }
      ]}
    />
  )
}