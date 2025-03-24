import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasksApi } from "@/lib/api/tasks";
import { Task, TaskPriority } from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { ApiError } from "@/lib/api/base";
import { displayApiError } from "@/lib/utils";

const priorityColors = {
    [TaskPriority.LOW]: "bg-green-500",
    [TaskPriority.MEDIUM]: "bg-yellow-500",
    [TaskPriority.HIGH]: "bg-red-500",
}

export default function TaskOptions({ task, boardId }: { task: Task, boardId: number }) {
    const [priority, setPriority] = useState<TaskPriority | null>(task.priority)
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

    const handlePriorityChange = (value: string) => {
        const newPriority = value === "null" ? null : value as TaskPriority
        setPriority(newPriority)
        updatePriorityMutation.mutate(newPriority)
    }

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
        }
    ]

    return (
        <div className="grid grid-cols-[auto_1fr] gap-y-4 gap-x-6">
            {elements.map((element) => (
                <div className="contents">
                    <p className="text-sm font-semibold w-max self-center text-muted-foreground">{element.label}</p>
                    {element.element}
                </div>
            ))}
        </div>
    )
}