import { z } from "zod"
import { boardsApi } from "@/lib/api/boards"
import { FormDialog } from "@/components/ui/form-dialog"

const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

type CreateBoardSchema = z.infer<typeof createBoardSchema>

interface CreateBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: number
}

export default function CreateBoardDialog({ open, onOpenChange, workspaceId }: CreateBoardDialogProps) {
  return (
    <FormDialog<CreateBoardSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Create new board"
      description="Add a new board to organize your tasks"
      schema={createBoardSchema}
      defaultValues={{ title: "" }}
      onSubmit={(data) => boardsApi.createBoard(workspaceId, data)}
      invalidateQueryKeys={[["workspaces"]]}
      submitButtonText="Create board"
      pendingButtonText="Creating..."
      successMessage="Board created successfully"
      errorMessage="Failed to create board"
      fields={[
        {
          name: "title",
          label: "Title",
          placeholder: "My Board"
        }
      ]}
    />
  )
}