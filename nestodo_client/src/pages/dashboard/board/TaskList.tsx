import { Task } from "@/types/task"
import { TaskList as TaskListType } from "@/types/taskList"
import { AddTask } from "./AddTask"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Trash } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api/base"
import { toast } from "sonner"
import { displayApiError } from "@/lib/utils"
import { taskListsApi } from "@/lib/api/taskLists"

interface TaskListProps {
    taskList: TaskListType
}

export default function TaskList({ taskList }: TaskListProps) {
    const queryClient = useQueryClient()

    const deleteTaskListMutation = useMutation({
        mutationFn: (taskListId: number) => taskListsApi.deleteTaskList(taskListId),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["board", taskList.boardId] })
            toast.success("Task list deleted successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to delete board", error)
        },
    })
    
    const handleDeleteTaskList = () => {
        deleteTaskListMutation.mutate(taskList.id)
    }

    return (
        <div
            key={taskList.id}
            className="flex flex-col max-h-full w-64 border border-border rounded-lg p-2"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold px-2">{taskList.title}</h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="ml-auto hover:text-foreground/50 cursor-pointer" size={18} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleDeleteTaskList()}>
                            <Trash />
                            Delete Task List
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2 mb-2 flex-[0_1_auto] overflow-y-auto">
                {taskList.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
            <Separator className="my-2" />
            <AddTask taskListId={taskList.id} boardId={taskList.boardId} />
        </div>
    )
}

function TaskCard({ task }: { task: Task }) {
    return (
        <div className="p-3 bg-muted/40 hover:bg-muted/80 border border-border rounded-lg cursor-pointer">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <h3 className="text-sm">{task.title}</h3>
                </div>
            </div>
        </div>
    )
}
