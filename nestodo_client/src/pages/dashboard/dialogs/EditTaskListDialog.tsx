import { z } from "zod"
import { taskListsApi } from "@/lib/api/taskLists"
import { FormDialog } from "@/components/ui/form-dialog"

const editTaskListSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

type EditTaskListSchema = z.infer<typeof editTaskListSchema>

interface EditTaskListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskListId: number
  boardId: number
  currentTitle: string
}

export default function EditTaskListDialog({ 
  open, 
  onOpenChange, 
  taskListId, 
  boardId, 
  currentTitle 
}: EditTaskListDialogProps) {
  return (
    <FormDialog<EditTaskListSchema>
      open={open}
      onOpenChange={onOpenChange}
      title="Edit task list"
      description="Change the name of your task list"
      schema={editTaskListSchema}
      defaultValues={{ title: currentTitle }}
      onSubmit={(data) => taskListsApi.updateTaskList(taskListId, data)}
      invalidateQueryKeys={[["board", boardId]]}
      submitButtonText="Save changes"
      pendingButtonText="Saving..."
      successMessage="Task list updated successfully"
      errorMessage="Failed to update task list"
      fields={[
        {
          name: "title",
          label: "Title",
          placeholder: "My Task List"
        }
      ]}
    />
  )
}