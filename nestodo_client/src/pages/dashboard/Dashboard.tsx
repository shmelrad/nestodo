import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { boardsApi } from "@/lib/api/boards";
import { AddTaskList } from "./board/AddTaskList";
import TaskList from "./board/TaskList";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { displayApiError } from "@/lib/utils";
import { ApiError } from "@/lib/api/base";
import { TaskList as TaskListType } from "@/types/taskList";

export default function DashboardPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { selectedWorkspaceId, getSelectedBoardId } = useWorkspaceStore((state) => state)
    const { data: workspaces, isLoading } = useQuery({
        queryKey: ["workspaces"],
        queryFn: () => workspacesApi.getWorkspaces(),
    })

    const selectedWorkspace = workspaces?.find((workspace) => workspace.id === selectedWorkspaceId)
    const selectedBoardId = getSelectedBoardId(selectedWorkspaceId || -1)

    const { data: selectedBoard } = useQuery({
        queryKey: ["board", selectedBoardId],
        queryFn: () => selectedBoardId ? boardsApi.getBoard(selectedBoardId) : null,
        enabled: !!selectedBoardId,
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
            boardsApi.reorderTaskLists(selectedBoardId!, taskLists.map(list => list.id)),
        onSuccess: () => {
            toast.success("Task lists reordered successfully");
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to reorder task lists", error);
            // Revert to original order by refetching
            queryClient.invalidateQueries({ queryKey: ["board", selectedBoardId] });
        },
    })

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) return;
        
        if (selectedBoard) {
            const oldIndex = selectedBoard.taskLists.findIndex(list => list.id === active.id);
            const newIndex = selectedBoard.taskLists.findIndex(list => list.id === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newTaskLists = arrayMove(selectedBoard.taskLists, oldIndex, newIndex);
                
                queryClient.setQueryData(["board", selectedBoardId], {
                    ...selectedBoard,
                    taskLists: newTaskLists
                });
                
                reorderTaskListsMutation.mutate(newTaskLists);
            }
        }
    }

    useEffect(() => {
        if (!isLoading && workspaces?.length === 0) {
            navigate("/creating-first-workspace")
        }
    }, [workspaces, navigate, isLoading]);

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <SidebarProvider className="flex min-h-screen flex-col">
            <DashboardHeader workspaceTitle={selectedWorkspace?.title || "Dashboard"} boardTitle={selectedBoard?.title} />
            <div className="flex-1 flex overflow-x-auto">
                <DashboardSidebar workspaces={workspaces!} />
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
                        <AddTaskList boardId={selectedBoardId || -1} />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}