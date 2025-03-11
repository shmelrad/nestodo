import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspaceStore";
export default function DashboardPage() {
    const { selectedWorkspaceId } = useWorkspaceStore((state) => state)
    const { data: workspaces, isLoading } = useQuery({
        queryKey: ["workspaces"],
        queryFn: () => workspacesApi.getWorkspaces(),
    })

    if (isLoading) {
        return <div>Loading...</div>
    }

    const selectedWorkspace = workspaces?.find((workspace) => workspace.id === selectedWorkspaceId)

    return (
        <SidebarProvider className="flex min-h-screen flex-col">
            <DashboardHeader workspaceTitle={selectedWorkspace?.title || "Dashboard" } />
            <div className="flex-1 flex">
                <DashboardSidebar workspaces={workspaces!} />
                <main className="flex-1">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="aspect-video rounded-xl bg-muted/50" />
                            <div className="aspect-video rounded-xl bg-muted/50" />
                            <div className="aspect-video rounded-xl bg-muted/50" />
                        </div>
                        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}