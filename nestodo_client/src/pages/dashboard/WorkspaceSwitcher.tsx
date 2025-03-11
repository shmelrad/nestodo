import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useState } from "react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Workspace } from "@/types/workspace"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useEffect } from "react"
import CreateWorkspaceDialog from "./CreateWorkspaceDialog"

export type WorkspaceSwitcherProps = {
    workspaces: Workspace[]
    defaultWorkspaceId: number
}

export function WorkspaceSwitcher({
    workspaces
}: WorkspaceSwitcherProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const {selectedWorkspaceId, setSelectedWorkspaceId} = useWorkspaceStore((state) => state)

    useEffect(() => {
        if (!selectedWorkspaceId) {
            if (workspaces.length > 0) {
                setSelectedWorkspaceId(workspaces[0].id)
            }
        }
    }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId])

    const selectedWorkspace = workspaces.find(workspace => workspace.id === selectedWorkspaceId);
    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <p>{selectedWorkspace?.title.charAt(0)}</p>
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">{selectedWorkspace?.title}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="min-w-54 p-3"
                            align="start"
                        >
                            <p className="text-sm text-muted-foreground cursor-default mb-2">Your workspaces</p>
                            {workspaces.map((workspace) => (
                                <DropdownMenuItem
                                    key={workspace.id}
                                    onSelect={() => setSelectedWorkspaceId(workspace.id)}
                                    className="cursor-pointer"
                                >
                                    {workspace.title}{" "}
                                    {workspace.id === selectedWorkspaceId && <Check className="ml-auto" />}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onSelect={() => setCreateDialogOpen(true)}
                            >
                                <Plus className="mr-2" />
                                Create new workspace
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            
            <CreateWorkspaceDialog 
                open={createDialogOpen} 
                onOpenChange={setCreateDialogOpen}
            />
        </>
    )
}
