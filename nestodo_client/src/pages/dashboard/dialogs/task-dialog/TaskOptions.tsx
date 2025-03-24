import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasksApi } from "@/lib/api/tasks";
import { Task, TaskPriority } from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { ApiError } from "@/lib/api/base";
import { displayApiError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TimeEstimationDialog } from "../../dialogs/TimeEstimationDialog";

const priorityColors = {
    [TaskPriority.LOW]: "bg-green-500",
    [TaskPriority.MEDIUM]: "bg-yellow-500",
    [TaskPriority.HIGH]: "bg-red-500",
}

export default function TaskOptions({ task, boardId }: { task: Task, boardId: number }) {
    const [priority, setPriority] = useState<TaskPriority | null>(task.priority)
    const [estimationDialogOpen, setEstimationDialogOpen] = useState(false)
    const queryClient = useQueryClient()

    const updatePriorityMutation = useMutation({
        mutationFn: (priority: TaskPriority | null) =>
            tasksApi.updateTask(task.id, { priority: priority }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            toast.success("Task priority updated")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to update task priority", error)
        },
    })

    const updateDurationMutation = useMutation({
        mutationFn: (duration: number | null) =>
            tasksApi.updateTask(task.id, { duration }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            toast.success("Task time estimate updated")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to update task time estimate", error)
        },
    })

    const handlePriorityChange = (value: string) => {
        const newPriority = value === "null" ? null : value as TaskPriority
        setPriority(newPriority)
        updatePriorityMutation.mutate(newPriority)
    }

    const handleDurationSave = (minutes: number | null) => {
        updateDurationMutation.mutate(minutes)
    }

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}ч ${mins}м`
    }

    const initialHours = task.duration ? Math.floor(task.duration / 60) : 0
    const initialMinutes = task.duration ? task.duration % 60 : 0

    const elements = [
        {
            label: "Priority",
            element: (
                <Select value={priority ?? "null"} onValueChange={handlePriorityChange} disabled={updatePriorityMutation.isPending}>
                    <SelectTrigger className="self-center" size="sm">
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">No priority</SelectItem>
                        <SelectItem value={TaskPriority.LOW}><span className={`${priorityColors[TaskPriority.LOW]} rounded-full w-2 h-2`}></span>Low</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}><span className={`${priorityColors[TaskPriority.MEDIUM]} rounded-full w-2 h-2`}></span>Medium</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}><span className={`${priorityColors[TaskPriority.HIGH]} rounded-full w-2 h-2`}></span>High</SelectItem>
                    </SelectContent>
                </Select>)
        },
        {
            label: "Time estimation",
            element: (
                task.duration !== null ? (
                    <div 
                        className="text-sm hover:bg-muted/50 py-1 rounded cursor-pointer w-fit px-4" 
                        onClick={() => setEstimationDialogOpen(true)}
                    >
                        {formatDuration(task.duration)}
                    </div>
                ) : (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-fit px-8"
                        onClick={() => setEstimationDialogOpen(true)}
                        disabled={updateDurationMutation.isPending}
                    >
                        Estimate...
                    </Button>
                )
            )
        }
    ]

    return (
        <>
            <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-6">
                {elements.map((element, index) => (
                    <div className="contents" key={index}>
                        <p className="text-sm font-semibold w-max self-center text-muted-foreground">{element.label}</p>
                        {element.element}
                    </div>
                ))}
            </div>
            
            <TimeEstimationDialog
                open={estimationDialogOpen}
                onOpenChange={setEstimationDialogOpen}
                initialHours={initialHours}
                initialMinutes={initialMinutes}
                onSave={handleDurationSave}
            />
        </>
    )
}