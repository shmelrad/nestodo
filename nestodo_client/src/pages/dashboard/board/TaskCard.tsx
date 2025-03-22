import { Subtask, Task, TaskPriority } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import TaskDialog from "@/pages/dashboard/dialogs/TaskDialog";
import { Circle, CircleCheck, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDndContext } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks";
import { ApiError } from "@/lib/api/base";
import { displayApiError } from "@/lib/utils";
import { toast } from "sonner";
import { Board } from "@/types/board";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { subtasksApi } from "@/lib/api/subtasks";

interface TaskCardProps {
    task: Task
    boardId: number
}

const priorityColors = {
    [TaskPriority.LOW]: "border-l-blue-500",
    [TaskPriority.MEDIUM]: "border-l-yellow-500",
    [TaskPriority.HIGH]: "border-l-red-500"
} as const

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
        mutationFn: () => tasksApi.updateTask(task.id, {completed: !task.completed}),
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
                className={`p-3 ${
                    task.completed ? 'bg-muted/20 border-border/40' : 'bg-muted/40 border-border'
                } hover:bg-muted/60 border rounded-lg cursor-pointer ${
                    isDragging ? "opacity-30" : ""
                } flex flex-col relative ${
                    task.priority ? `border-l-4 ${priorityColors[task.priority]}` : ''
                }`}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={handleTaskClick}
                onMouseEnter={() => setIsMouseOver(true)}
                onMouseLeave={() => setIsMouseOver(false)}
            >
                <div className="flex items-center">
                    {!isDraggingTask && (
                        <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                                <div 
                                    onClick={handleToggleCompletion} 
                                    className={`absolute left-3 transition-all duration-300 ease-in-out ${isMouseOver ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                                >
                                    {task.completed ? (
                                        <CircleCheck className="size-4.5 text-green-500 hover:text-green-600" />
                                    ) : (
                                        <Circle className="size-4.5 text-muted-foreground hover:text-foreground/80" />
                                    )}
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
                {task.subtasks && task.subtasks.length > 0 && (
                    <SubtasksList subtasks={task.subtasks} boardId={boardId} />
                )}
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

const SubtasksList = ({ subtasks, boardId }: { subtasks: Subtask[], boardId: number }) => {
    const queryClient = useQueryClient()
    const [isSubtasksOpen, setIsSubtasksOpen] = useState(false)

    const completedSubtasks = subtasks.filter(s => s.completed).length
    const totalSubtasks = subtasks.length
    const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100


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

    const handleSubtaskClick = (e: React.MouseEvent, subtask: Subtask) => {
        e.stopPropagation()
        toggleSubtaskMutation.mutate(subtask)
    }

    return (
        <Collapsible open={isSubtasksOpen} onOpenChange={setIsSubtasksOpen}>
            <div className="flex items-center mt-2 justify-between w-full" onClick={(e) => e.stopPropagation()}>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-muted/90">
                        <ChevronDown className={`transition-transform ${isSubtasksOpen ? "transform rotate-180" : ""}`} />
                            <div className="h-1 w-28 bg-muted rounded-full overflow-hidden ml-2">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        <span className="text-sm text-muted-foreground">
                            ({completedSubtasks}/{totalSubtasks})
                        </span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <div className="space-y-2 mt-1 pl-2.5">
                    {subtasks.map((subtask) => (
                        <div
                            key={subtask.id}
                            className="flex items-center gap-2 group"
                        >
                            {subtask.completed ? (
                                <CircleCheck onClick={(e) => handleSubtaskClick(e, subtask)} className="h-4 w-4 text-green-500 cursor-pointer" />
                            ) : (
                                <Circle onClick={(e) => handleSubtaskClick(e, subtask)} className="h-4 w-4 text-muted-foreground cursor-pointer" />
                            )}
                            <span className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
