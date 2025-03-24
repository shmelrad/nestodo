import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/lib/api/tasks"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { TimeEstimationDialog } from "../../TimeEstimationDialog"
import { Task } from "@/types/task"

interface TimeEstimationProps {
    task: Task
    boardId: number
}

export default function TimeEstimation({ task, boardId }: TimeEstimationProps) {
    const [estimationDialogOpen, setEstimationDialogOpen] = useState(false)
    const queryClient = useQueryClient()
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


    const handleDurationSave = (minutes: number | null) => {
        updateDurationMutation.mutate(minutes)
    }

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const initialHours = task.duration ? Math.floor(task.duration / 60) : 0
    const initialMinutes = task.duration ? task.duration % 60 : 0

    return (
        <>
            {task.duration !== null ? (
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
            )}
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
