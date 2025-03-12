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
            <div className="flex-1 flex overflow-x-auto">
                <DashboardSidebar workspaces={workspaces!} />
                <main className="p-6 flex flex-col h-[calc(100vh-var(--spacing)*14-20px)]">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-semibold">Task Lists</h2>
                    </div>
                    <div className="flex flex-1 min-h-0 w-full h-full items-start gap-4">
                        {selectedBoard?.taskLists.map((taskList) => (
                            <TaskList key={taskList.id} taskList={taskList} />
                        ))}
                        <AddTaskList boardId={selectedBoardId || -1} />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}