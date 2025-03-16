import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "./board/Board";

export default function DashboardPage() {
    const navigate = useNavigate()
    const { selectedWorkspaceId, getSelectedBoardId } = useWorkspaceStore((state) => state)
    const { data: workspaces, isLoading } = useQuery({
        queryKey: ["workspaces"],
        queryFn: () => workspacesApi.getWorkspaces(),
    })

    const selectedWorkspace = workspaces?.find((workspace) => workspace.id === selectedWorkspaceId)
    const selectedBoardId = getSelectedBoardId(selectedWorkspaceId || -1)

    useEffect(() => {
        if (!isLoading && workspaces?.length === 0) {
            navigate("/creating-first-workspace")
        }
    }, [workspaces, navigate, isLoading])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <SidebarProvider className="flex min-h-screen flex-col">
            <DashboardHeader 
                workspaceTitle={selectedWorkspace?.title || "Dashboard"} 
                boardTitle={selectedWorkspace?.boards.find(b => b.id === selectedBoardId)?.title} 
            />
            <div className="flex-1 flex overflow-x-auto">
                <DashboardSidebar workspaces={workspaces!} />
                {selectedBoardId && <Board boardId={selectedBoardId} />}
            </div>
        </SidebarProvider>
    )
}