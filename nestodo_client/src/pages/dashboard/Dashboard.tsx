import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WorkspaceCard from "./WorkspaceCard";
import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import { useState } from "react";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

export default function DashboardPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const workspaces = useQuery({
        queryKey: ["workspaces"],
        queryFn: () => workspacesApi.getWorkspaces(),
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Your Workspaces</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your workspaces
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create new workspace
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.data && workspaces.data.length > 0 ? (
                    workspaces.data.map((workspace) => (
                        <WorkspaceCard key={workspace.id} workspace={workspace} />
                    ))
                ) : (
                    <p>You have no workspaces yet</p>
                )}
            </div>
            <CreateWorkspaceDialog 
                open={createDialogOpen} 
                onOpenChange={setCreateDialogOpen} 
            />
        </div>
    );
}