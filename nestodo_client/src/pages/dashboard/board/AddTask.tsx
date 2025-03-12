import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { tasksApi } from "@/lib/api/tasks"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"
import { toast } from "sonner"
import { Board } from "@/types/board"

interface AddTaskProps {
    taskListId: number
    boardId: number
}

export function AddTask({ taskListId, boardId }: AddTaskProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState("")
    const queryClient = useQueryClient()

    const createTaskMutation = useMutation({
        mutationFn: (title: string) => tasksApi.createTask({ title, taskListId }),
        onSuccess: (newTask) => {
            queryClient.setQueryData(["board", boardId], (oldData: Board) => {
                const updatedTaskLists = oldData.taskLists.map((taskList) => {
                    if (taskList.id === taskListId) {
                        return {
                            ...taskList,
                            tasks: [...taskList.tasks, newTask]
                        }
                    }
                    return taskList
                })
                return {
                    ...oldData,
                    taskLists: updatedTaskLists
                }
            })
            setTitle("")
            setIsEditing(false)
            toast.success("Task created successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to create task", error)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (title.trim()) {
            createTaskMutation.mutate(title)
        } else {
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <form 
                onSubmit={handleSubmit}
                className="flex-shrink-0"
            >
                <Input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="bg-muted/50"
                    disabled={createTaskMutation.isPending}
                />
            </form>
        )
    }

    return (
        <Button
            variant="ghost"
            className="flex-shrink-0 justify-start text-muted-foreground"
            onClick={() => setIsEditing(true)}
        >
            <Plus className="h-5 w-5 mr-2" />
            Add new task
        </Button>
    )
}