import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/lib/api/tasks"
import { subtasksApi } from "@/lib/api/subtasks"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"
import { toast } from "sonner"
import { Task, Subtask } from "@/types/task"
import { Trash, ChevronDown, Plus, Circle, CircleCheck } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import AttachmentsList from "./AttachmentsList"
import TaskOptions from "./task-options/TaskOptions"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Separator } from "@/components/ui/separator"
import { AutosizeTextarea } from "@/components/ui/autosize-textarea"
interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task
    boardId: number
    workspaceId: number
}

export default function TaskDialog({ open, onOpenChange, task, boardId, workspaceId }: TaskDialogProps) {
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
            <DialogContent className="flex flex-col min-w-xl max-w-7xl overflow-y-auto max-h-screen" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader className="gap-0">
                    <DialogTitle>
                        <form onSubmit={handleTitleSubmit}>
                            <AutosizeTextarea
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="shadow-none text-lg h-4 md:text-xl font-semibold resize-none w-full bg-transparent dark:bg-transparent outline-none border-none focus:border border-border focus:bg-muted/50 focus:dark:bg-muted/50 rounded-md px-1"
                                offsetBorder={0}
                                onBlur={handleTitleSubmit}
                                onKeyDown={handleKeyDown}
                                disabled={updateTaskMutation.isPending}
                            />
                        </form>
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-1 gap-4">
                    <div className="flex flex-col flex-1 overflow-auto gap-4">
                        <TaskOptions task={task} boardId={boardId} workspaceId={workspaceId} />
                        <div className="flex-1 rounded-md">
                            <h3 className="text-sm font-semibold mb-2">Description</h3>
                            <AutosizeTextarea
                                className="p-3 resize-none"
                                placeholder="Add description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={handleDescriptionUpdate}
                                disabled={updateTaskMutation.isPending}
                            />
                        </div>
                        <Separator />
                        <SubtasksList subtasks={task.subtasks} taskId={task.id} boardId={boardId} />
                        <AttachmentsList attachments={task.attachments} taskId={task.id} boardId={boardId} />
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

const SubtasksList = ({ subtasks, taskId, boardId }: { subtasks: Subtask[], taskId: number, boardId: number }) => {
    const queryClient = useQueryClient()
    const [isSubtasksOpen, setIsSubtasksOpen] = useState(true)
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

    const completedSubtasks = subtasks.filter(s => s.completed).length
    const totalSubtasks = subtasks.length
    const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault()
        if (newSubtaskTitle.trim()) {
            addSubtaskMutation.mutate(newSubtaskTitle.trim())
        }
    }

    const addSubtaskMutation = useMutation({
        mutationFn: (title: string) => subtasksApi.createSubtask({ title, taskId: taskId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            setNewSubtaskTitle("")
            toast.success("Subtask added successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to add subtask", error)
        },
    })

    const toggleSubtaskMutation = useMutation({
        mutationFn: (subtask: Subtask) =>
            subtasksApi.updateSubtask(subtask.id, { completed: !subtask.completed }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to update subtask", error)
        },
    })

    return (
        <Collapsible open={isSubtasksOpen} onOpenChange={setIsSubtasksOpen}>
            <div className="flex items-center justify-between mb-2">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="!px-0 hover:bg-transparent">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isSubtasksOpen ? "transform rotate-180" : ""}`} />
                        <div className="flex items-center gap-2 relative">
                            <span className="text-sm font-semibold ml-2">Subtasks</span>
                            <svg className="size-4 mt-1 ml-2">
                                <circle
                                    cx="8"
                                    cy="8"
                                    r="6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-muted"
                                />
                                <circle
                                    cx="8"
                                    cy="8"
                                    r="6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray={`${2 * Math.PI * 6}`}
                                    strokeDashoffset={`${2 * Math.PI * 6 * (1 - progress / 100)}`}
                                    className="text-green-500 transition-all"
                                    transform="rotate(-90 8 8)"
                                />
                            </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            ({completedSubtasks}/{totalSubtasks})
                        </span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <div className="space-y-2">
                    {subtasks.map((subtask) => (
                        <div
                            key={subtask.id}
                            className="flex items-center gap-2 group"
                            onClick={() => toggleSubtaskMutation.mutate(subtask)}
                        >
                            {subtask.completed ? (
                                <CircleCheck className="h-4 w-4 text-green-500 cursor-pointer" />
                            ) : (
                                <Circle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                            )}
                            <span className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                    <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                        <Input
                            placeholder="Add a subtask..."
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            className="h-8 text-sm"
                        />
                        <Button
                            size="sm"
                            type="submit"
                            disabled={addSubtaskMutation.isPending || !newSubtaskTitle.trim()}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
