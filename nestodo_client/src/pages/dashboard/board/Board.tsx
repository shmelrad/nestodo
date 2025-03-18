import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { boardsApi } from "@/lib/api/boards"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"
import { toast } from "sonner"
import { TaskList as TaskListType } from "@/types/taskList"
import TaskList from "./TaskList"
import { AddTaskList } from "./AddTaskList"
import { Task } from "@/types/task"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import TaskCard from "./TaskCard"
import { Board as BoardType } from "@/types/board"
import { tasksApi } from "@/lib/api/tasks"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface BoardProps {
    boardId: number
}

type FilterOption = "all" | "complete" | "incomplete";

export default function Board({ boardId }: BoardProps) {
    const [activeTaskList, setActiveTaskList] = useState<TaskListType | null>(null)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [initialTaskPosition, setInitialTaskPosition] = useState<{
        taskId: number,
        sourceTaskListId: number
    } | null>(null)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filter, setFilter] = useState<FilterOption>("all")

    const queryClient = useQueryClient()

    const { data: board } = useQuery({
        queryKey: ["board", boardId],
        queryFn: () => boardsApi.getBoard(boardId),
        enabled: !!boardId,
    })

    const taskListsIds = useMemo(() => {
        return board?.taskLists.map((taskList) => taskList.id) ?? []
    }, [board])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const reorderTaskListsMutation = useMutation({
        mutationFn: (taskLists: TaskListType[]) =>
            boardsApi.reorderTaskLists(boardId, taskLists.map(list => list.id)),
        onSuccess: () => {
            toast.success("Task list moved successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to move task list", error)
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
        },
    })

    const moveTaskMutation = useMutation({
        mutationFn: (params: {
            taskId: number,
            sourceTaskListId: number,
            destinationTaskListId: number,
            newPosition: number
        }) => {
            return tasksApi.moveTask(params.taskId, {
                sourceTaskListId: params.sourceTaskListId,
                destinationTaskListId: params.destinationTaskListId,
                newPosition: params.newPosition
            })
        },
        onSuccess: () => {
            toast.success("Task moved successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to move task", error)
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
        }
    })

    const filteredTaskLists = useMemo(() => {
        if (!board) return []
        
        return board.taskLists.map(taskList => {
            const filteredTasks = taskList.tasks.filter(task => {
                if (filter === "complete") return task.completed;
                if (filter === "incomplete") return !task.completed;
                return true;
            })
            
            return {
                ...taskList,
                tasks: filteredTasks
            }
        })
    }, [board, filter])

    const isFilterActive = filter !== "all";

    if (!board) return null

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'taskList') {
            setActiveTaskList(event.active.data.current.taskList)
        }
        else if (event.active.data.current?.type === 'task') {
            const task = event.active.data.current.task
            setActiveTask(task)

            setInitialTaskPosition({
                taskId: task.id,
                sourceTaskListId: task.taskListId
            })
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        // Handle task list reordering
        if (active.data.current?.type === 'taskList' && over && active.id !== over.id) {
            const oldIndex = board.taskLists.findIndex(list => list.id === active.id)
            const newIndex = board.taskLists.findIndex(list => list.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                const newTaskLists = arrayMove(board.taskLists, oldIndex, newIndex)
                queryClient.setQueryData(["board", boardId], {
                    ...board,
                    taskLists: newTaskLists
                })
                reorderTaskListsMutation.mutate(newTaskLists)
            }
        }

        if (initialTaskPosition && over && active.data.current?.type === 'task') {
            let destinationTaskListId: number

            if (over.data.current?.type === 'task') {
                destinationTaskListId = over.data.current.task.taskListId
            } else if (over.data.current?.type === 'taskList') {
                destinationTaskListId = +over.id
            } else {
                return
            }

            const destList = board.taskLists.find(list => list.id === destinationTaskListId)
            if (!destList) return

            const newPosition = destList.tasks.findIndex(t => t.id === initialTaskPosition.taskId)

            moveTaskMutation.mutate({
                taskId: initialTaskPosition.taskId,
                sourceTaskListId: initialTaskPosition.sourceTaskListId,
                destinationTaskListId,
                newPosition: newPosition !== -1 ? newPosition : 0
            })
        }

        setActiveTaskList(null)
        setActiveTask(null)
        setInitialTaskPosition(null)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = +active.id
        const overId = +over.id

        const isActiveTask = active.data.current?.type === 'task'
        const isOverTask = over.data.current?.type === 'task'

        // if we are dragging a column or task over itself don't do anything
        if (!isActiveTask || (activeId === overId && isOverTask)) return
        const activeTask = active.data.current?.task
        const sourceTaskList = board.taskLists.find(list => list.id === activeTask.taskListId)
        const targetTaskListId = isOverTask ? over.data.current?.task.taskListId : over.data.current?.taskList.id
        const targetTaskList = board.taskLists.find(list => list.id === targetTaskListId)


        if (!sourceTaskList || !targetTaskList) return

        queryClient.setQueryData(["board", boardId], (oldData: BoardType) => {
            // Create a deep copy of task lists to avoid direct state mutation
            const newTaskLists = structuredClone(oldData.taskLists);

            // Find indices for source and target task lists in the board
            const sourceTaskListIndex = newTaskLists.findIndex(list => list.id === sourceTaskList.id);
            const targetTaskListIndex = newTaskLists.findIndex(list => list.id === targetTaskList.id);

            // Within one task list
            if (sourceTaskListIndex === targetTaskListIndex) {
                const activeTaskIndex = newTaskLists[sourceTaskListIndex].tasks.findIndex(t => t.id === activeId);
                const overTaskIndex = newTaskLists[sourceTaskListIndex].tasks.findIndex(t => t.id === overId);

                return {
                    ...oldData,
                    taskLists: newTaskLists.map(list => {
                        if (list.id === sourceTaskList.id) {
                            return {
                                ...list,
                                tasks: arrayMove(list.tasks, activeTaskIndex, overTaskIndex)
                            }
                        }
                        return list
                    })
                }
            }

            // Find the task to move in the source list
            const taskIndex = newTaskLists[sourceTaskListIndex].tasks.findIndex(t => t.id === activeTask.id);

            // Remove task from source list
            const [removedTask] = newTaskLists[sourceTaskListIndex].tasks.splice(taskIndex, 1);

            // Update the task's taskListId to match the new list
            removedTask.taskListId = targetTaskList.id;

            // Determine insertion position in target list
            let insertPosition;
            if (isOverTask) {
                // If over another task, insert before or after that task
                const overTaskIndex = newTaskLists[targetTaskListIndex].tasks.findIndex(t => t.id === overId);
                insertPosition = overTaskIndex !== -1 ? overTaskIndex : newTaskLists[targetTaskListIndex].tasks.length;
            } else {
                // If over a task list, add at the start
                insertPosition = 0;
            }

            // Insert task at the new position in target list
            newTaskLists[targetTaskListIndex].tasks.splice(insertPosition, 0, removedTask);

            // Return updated board
            return {
                ...oldData,
                taskLists: newTaskLists
            };
        })
    }

    const clearFilters = () => {
        setFilter("all");
    }

    return (
        <main className="p-6 flex flex-col h-[calc(100vh-var(--spacing)*14-20px)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Task Lists</h2>
                <div className="flex items-center gap-2">
                    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Filter className="h-4 w-4" />
                                Filters
                                {isFilterActive && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        1
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="end">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-sm">Filter</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-xs" 
                                    onClick={clearFilters}
                                >
                                    Clear all
                                </Button>
                            </div>
                            <Separator className="my-2" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium mb-1">Card status</h4>
                                <RadioGroup value={filter} onValueChange={(val: string) => setFilter(val as FilterOption)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem id="all-tasks" value="all" />
                                        <Label htmlFor="all-tasks" className="text-sm">All tasks</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem id="marked-complete" value="complete" />
                                        <Label htmlFor="marked-complete" className="text-sm">Marked as complete</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem id="not-marked-complete" value="incomplete" />
                                        <Label htmlFor="not-marked-complete" className="text-sm">Not marked as complete</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <div className="flex flex-1 min-h-0 w-full h-full items-start gap-4">
                    <SortableContext items={taskListsIds ?? []}>
                        {board && (
                            filteredTaskLists.map((taskList) => (
                                <TaskList key={taskList.id} taskList={taskList} />
                            ))
                        )}
                    </SortableContext>
                    <AddTaskList boardId={boardId} />
                </div>
                {createPortal(
                    <DragOverlay modifiers={activeTaskList ? [restrictToHorizontalAxis] : []}>
                        {
                            activeTaskList &&
                            <TaskList taskList={activeTaskList} />
                        }
                        {
                            activeTask &&
                            <TaskCard task={activeTask} boardId={boardId} />
                        }
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </main>
    )
}