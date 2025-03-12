import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { boardsApi } from "@/lib/api/boards";
import { AddTaskList } from "./board/AddTaskList";

export default function DashboardPage() {
    const navigate = useNavigate()
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
            <div className="flex-1 flex overflow-hidden">
                <DashboardSidebar workspaces={workspaces!} />
                <main className="flex-1 overflow-hidden">
                    <div className="h-full p-6 flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-semibold">Task Lists</h2>
                        </div>
                        <ScrollArea className="flex-1 w-full h-full overflow-auto">
                            <div className="flex gap-4 pb-4">
                                {selectedBoard?.taskLists.map((taskList) => (
                                    <div
                                        key={taskList.id}
                                        className="flex flex-1 w-64 bg-muted/50 rounded-lg p-4"
                                    >
                                        <h3 className="font-medium mb-4">{taskList.title}</h3>
                                        <ScrollArea className="flex-1">
                                            <div className="flex flex-col gap-2 pr-4">
                                                {taskList.tasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="bg-background rounded-md p-3 shadow-sm"
                                                    >
                                                        <p>{task.title}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                ))}
                                <AddTaskList boardId={selectedBoardId || -1} />
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}