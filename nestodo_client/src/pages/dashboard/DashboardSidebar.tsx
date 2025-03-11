import * as React from "react"

import { WorkspaceSwitcher } from "@/pages/dashboard/WorkspaceSwitcher"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Workspace } from "@/types/workspace";

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
    workspaces: Workspace[]
}
export function DashboardSidebar({ workspaces, ...props }: DashboardSidebarProps) {
    const navigate = useNavigate()

    const selectedWorkspaceId = useWorkspaceStore((state) => state.selectedWorkspaceId)
    const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)

    useEffect(() => {
        if (workspaces.length === 0) {
            navigate("/creating-first-workspace")
        }
    }, [workspaces, navigate]);

    return (
        <Sidebar
            className="hidden border-r pt-14 md:block"
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <WorkspaceSwitcher
                    workspaces={workspaces}
                    defaultWorkspaceId={workspaces[0]?.id ?? 0}
                />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarSeparator />
                    <SidebarGroupLabel>Boards</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {selectedWorkspace?.boards.map((board) => (
                                <SidebarMenuItem key={board.id}>
                                    <SidebarMenuButton>
                                        <div className="flex aspect-square size-6 items-center justify-center rounded-sm bg-red-400 text-sidebar-primary-foreground">
                                            <p className="text-sm">{board.title.charAt(0)}</p>
                                        </div>
                                        <a href={`/dashboard/${board.id}`}>{board.title}</a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}