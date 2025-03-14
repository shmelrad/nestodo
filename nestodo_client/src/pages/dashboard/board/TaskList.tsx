import { Task } from "@/types/task"
import { TaskList as TaskListType } from "@/types/taskList"
import { AddTask } from "./AddTask"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { EllipsisVertical, GripVertical, Trash } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api/base"
import { toast } from "sonner"
import { displayApiError } from "@/lib/utils"
import { taskListsApi } from "@/lib/api/taskLists"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

interface TaskListProps {
    taskList: TaskListType
}

export default function TaskList({ taskList }: TaskListProps) {
    const queryClient = useQueryClient()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: taskList.id,
        data: {
            type: "taskList",
            taskList
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

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
            ref={setNodeRef}
            style={style}
            key={taskList.id}
            className={cn(
                "flex flex-col max-h-full w-64 border border-border rounded-lg p-2",
                isDragging && "opacity-50 z-10"
            )}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div 
                        {...attributes} 
                        {...listeners}
                        className="cursor-grab hover:text-foreground/70 touch-none"
                    >
                        <GripVertical size={18} />
                    </div>
                    <h3 className="font-bold">{taskList.title}</h3>
                </div>
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
