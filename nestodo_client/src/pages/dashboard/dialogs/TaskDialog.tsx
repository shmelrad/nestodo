import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/lib/api/tasks"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"
import { toast } from "sonner"
import { Task } from "@/types/task"
import { Trash } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task
    boardId: number
}

export default function TaskDialog({ open, onOpenChange, task, boardId }: TaskDialogProps) {
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || "")
    const queryClient = useQueryClient()

    const updateTaskMutation = useMutation({
        mutationFn: (data: { title?: string; description?: string }) =>
            tasksApi.updateTask(task.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            toast.success("Task updated successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to update task", error)
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: () => tasksApi.deleteTask(task.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            toast.success("Task deleted successfully")
            onOpenChange(false)
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to delete task", error)
        },
    })

    const handleTitleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (title.trim()) {
            if (title.trim() !== task.title) {
                updateTaskMutation.mutate({ title })
            }
        } else {
            setTitle(task.title)
        }
    }

    const handleDescriptionUpdate = () => {
        if (description !== task.description) {
            updateTaskMutation.mutate({ description })
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    const handleDelete = () => {
        deleteTaskMutation.mutate()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-xl max-w-6xl">
                <DialogHeader>
                    <form onSubmit={handleTitleSubmit}>
                        <textarea
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg md:text-xl h-8 focus:h-auto font-semibold mb-2 resize-none w-full outline-none focus:border border-border focus:bg-muted/50 rounded-md px-1"
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleKeyDown}
                            disabled={updateTaskMutation.isPending}
                        />
                    </form>
                </DialogHeader>

                <div className="flex gap-8">
                    <div className="flex-1 rounded-md">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-2">Description</h3>
                            <Textarea
                                className="p-3 resize-none"
                                placeholder="Add description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={handleDescriptionUpdate}
                                disabled={updateTaskMutation.isPending}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold">Actions</h3>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-muted-foreground"
                            onClick={handleDelete}
                            disabled={deleteTaskMutation.isPending}
                        >
                            <Trash className="h-5 w-5 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}