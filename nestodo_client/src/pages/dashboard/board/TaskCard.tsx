import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import TaskDialog from "@/pages/dashboard/dialogs/TaskDialog";
import { Circle, CircleCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDndContext } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks";
import { ApiError } from "@/lib/api/base";
import { displayApiError } from "@/lib/utils";
import { toast } from "sonner";
import { Board } from "@/types/board";

interface TaskCardProps {
    task: Task
    boardId: number
}

export default function TaskCard({ task, boardId }: TaskCardProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isMouseOver, setIsMouseOver] = useState(false);
    const { attributes, listeners, setNodeRef, transition, transform, isDragging } = useSortable(
        {
            id: `${task.id}`,
            data: {
                type: 'task',
                task
            }
        }
    )

    const { active } = useDndContext();
    const isDraggingTask = active?.data?.current?.type === 'task';
    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const queryClient = useQueryClient();

    const toggleCompletionMutation = useMutation({
        mutationFn: () => tasksApi.updateTask(task.id, { completed: !task.completed }),
        onSuccess: (updatedTask) => {
            // Update the board data in the cache
            queryClient.setQueryData(["board", boardId], (oldData: Board) => {
                const updatedTaskLists = oldData.taskLists.map((taskList) => {
                    if (taskList.id === task.taskListId) {
                        return {
                            ...taskList,
                            tasks: taskList.tasks.map((t) => 
                                t.id === task.id ? updatedTask : t
                            )
                        };
                    }
                    return taskList;
                });
                return {
                    ...oldData,
                    taskLists: updatedTaskLists
                };
            });
            
            toast.success(`Task marked as ${updatedTask.completed ? 'complete' : 'incomplete'}`);
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to update task", error);
        }
    });

    const handleTaskClick = (e: React.MouseEvent) => {
        if (!isDragging) {
            e.stopPropagation();
            setEditDialogOpen(true);
        }
    }

    const handleToggleCompletion = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleCompletionMutation.mutate();
    }

    return (
        <>
            <div
                className={`p-3 ${task.completed ? 'bg-muted/20 border-border/40' : 'bg-muted/40 border-border'} hover:bg-muted/80 border rounded-lg cursor-pointer ${isDragging ? "opacity-30" : ""} flex items-center relative`}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={handleTaskClick}
                onMouseEnter={() => setIsMouseOver(true)}
                onMouseLeave={() => setIsMouseOver(false)}
            >
                {!isDraggingTask && (
                    <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                            <div 
                                onClick={handleToggleCompletion} 
                                className={`absolute left-3 transition-all duration-300 ease-in-out ${isMouseOver ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                            >
                                {
                                    task.completed ? (
                                        <CircleCheck
                                            className="size-4.5 text-green-500 hover:text-green-600"
                                        />
                                    ) : (
                                        <Circle
                                            className="size-4.5 text-muted-foreground hover:text-foreground/80"
                                        />
                                    )
                                }
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{task.completed ? "Mark as incomplete" : "Mark as complete"}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                <div className={`flex flex-col gap-2 transition-all duration-300 ease-in-out ${isMouseOver && !isDraggingTask ? "ml-6" : "ml-0"}`}>
                    <div className="flex items-start justify-between">
                        <h3 className={`${task.completed ? 'text-muted-foreground line-through' : ''} text-sm whitespace-pre-wrap [overflow-wrap:anywhere] ${isDragging ? "invisible" : ""}`}>{task.title}</h3>
                    </div>
                </div>
            </div>

            <TaskDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                task={task}
                boardId={boardId}
            />
        </>
    )
}