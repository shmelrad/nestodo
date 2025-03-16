import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { boardsApi } from "@/lib/api/boards"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"
import { toast } from "sonner"
import { TaskList as TaskListType } from "@/types/taskList"
import TaskList from "./TaskList"
import { AddTaskList } from "./AddTaskList"

interface BoardProps {
    boardId: number
}

export default function Board({ boardId }: BoardProps) {
    const queryClient = useQueryClient()

    const { data: selectedBoard } = useQuery({
        queryKey: ["board", boardId],
        queryFn: () => boardsApi.getBoard(boardId),
        enabled: !!boardId,
    })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    )

    const reorderTaskListsMutation = useMutation({
        mutationFn: (taskLists: TaskListType[]) => 
            boardsApi.reorderTaskLists(boardId, taskLists.map(list => list.id)),
        onSuccess: () => {
            toast.success("Task lists reordered successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to reorder task lists", error)
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
        },
    })

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        
        if (!over || active.id === over.id) return
        
        if (selectedBoard) {
            const oldIndex = selectedBoard.taskLists.findIndex(list => list.id === active.id)
            const newIndex = selectedBoard.taskLists.findIndex(list => list.id === over.id)
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newTaskLists = arrayMove(selectedBoard.taskLists, oldIndex, newIndex)
                
                queryClient.setQueryData(["board", boardId], {
                    ...selectedBoard,
                    taskLists: newTaskLists
                })
                
                reorderTaskListsMutation.mutate(newTaskLists)
            }
        }
    }

    return (
        <main className="p-6 flex flex-col h-[calc(100vh-var(--spacing)*14-20px)]">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Task Lists</h2>
            </div>
            <div className="flex flex-1 min-h-0 w-full h-full items-start gap-4">
                {selectedBoard && selectedBoard.taskLists.length > 0 && (
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={selectedBoard.taskLists.map(list => list.id)} 
                            strategy={horizontalListSortingStrategy}
                        >
                            {selectedBoard.taskLists.map((taskList) => (
                                <TaskList key={taskList.id} taskList={taskList} />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
                <AddTaskList boardId={boardId} />
            </div>
        </main>
    )
}