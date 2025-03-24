import { z } from 'zod'
import { boardsApi } from '@/lib/api/boards'
import { FormDialog } from '@/components/ui/form-dialog'

const editBoardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

type EditBoardSchema = z.infer<typeof editBoardSchema>

interface EditBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: number
  currentTitle: string
}

export default function EditBoardDialog({
  open,
  onOpenChange,
  boardId,
  currentTitle,
}: EditBoardDialogProps) {
  return (
    <FormDialog<EditBoardSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Edit board"
      description="Change the name of your board"
      schema={editBoardSchema}
      defaultValues={{ title: currentTitle }}
      onSubmit={(data) => boardsApi.updateBoard(boardId, data)}
      invalidateQueryKeys={[['workspaces'], ['board', boardId]]}
      submitButtonText="Save changes"
      pendingButtonText="Saving..."
      successMessage="Board updated successfully"
      errorMessage="Failed to update board"
      fields={[
        {
          name: 'title',
          label: 'Title',
          placeholder: 'My Board',
        },
      ]}
    />
  )
}
