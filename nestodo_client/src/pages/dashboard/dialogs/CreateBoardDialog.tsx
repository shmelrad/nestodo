import { z } from "zod"
import { boardsApi } from "@/lib/api/boards"
import { FormDialog } from "@/components/ui/form-dialog"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useMutation } from "@tanstack/react-query"
import { Board } from "@/types/board"

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
  const setSelectedBoardId = useWorkspaceStore((state) => state.setSelectedBoardId)

  const createBoardMutation = useMutation({
    mutationFn: (data: CreateBoardSchema) => boardsApi.createBoard(workspaceId, data),
    onSuccess: (board: Board) => {
      setSelectedBoardId(workspaceId, board.id)
    }
  })

  return (
    <FormDialog<CreateBoardSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Create new board"
      description="Add a new board to organize your tasks"
      schema={createBoardSchema}
      defaultValues={{ title: "" }}
      onSubmit={(data) => createBoardMutation.mutateAsync(data)}
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