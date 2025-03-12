import * as React from "react"
import CreateBoardDialog from "./dialogs/CreateBoardDialog"

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
import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Workspace } from "@/types/workspace";
import { CircleFadingPlus, EllipsisVertical, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api/boards";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/base";
import { displayApiError } from "@/lib/utils";

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
    workspaces: Workspace[]
}

export function DashboardSidebar({ workspaces, ...props }: DashboardSidebarProps) {
    const { selectedWorkspaceId, getSelectedBoardId, setSelectedBoardId } = useWorkspaceStore((state) => state)
    const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const queryClient = useQueryClient()

    const deleteBoardMutation = useMutation({
        mutationFn: (boardId: number) => boardsApi.deleteBoard(boardId),
        onSuccess: async (_, boardId) => {
            queryClient.setQueryData(["workspaces"], (oldData: Workspace[]) => {
                const updatedWorkspaces = oldData.map((workspace) => {
                    if (workspace.id === selectedWorkspaceId) {
                        return {
                            ...workspace,
                            boards: workspace.boards.filter((board) => board.id !== boardId)
                        }
                    }
                    return workspace
                })
                return updatedWorkspaces
            })
            toast.success("Board deleted successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to delete board", error)
        },
    })
    
    useEffect(() => {
        if (selectedWorkspace?.boards.length && !getSelectedBoardId(selectedWorkspace.id)) {
            setSelectedBoardId(selectedWorkspace.id, selectedWorkspace.boards[0].id)
        }
    }, [selectedWorkspace, getSelectedBoardId, setSelectedBoardId])

    const handleDeleteBoard = (boardId: number) => {
        if (selectedWorkspace && getSelectedBoardId(selectedWorkspace.id) === boardId && selectedWorkspace?.boards.length > 1) {
            setSelectedBoardId(selectedWorkspace.id, selectedWorkspace.boards[0].id)
        }
        deleteBoardMutation.mutate(boardId)
    };

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
                    <SidebarGroupLabel className="flex items-center justify-between">
                        Boards
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <CircleFadingPlus
                                        className="size-4 hover:cursor-pointer hover:text-blue-400 transition-all duration-100"
                                        onClick={() => setCreateDialogOpen(true)}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Create new board</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {selectedWorkspace?.boards.map((board) => (
                                <SidebarMenuItem key={board.id}>
                                    <SidebarMenuButton
                                        onClick={() => setSelectedBoardId(selectedWorkspace.id, board.id)}
                                        className={getSelectedBoardId(selectedWorkspace.id) === board.id ? "bg-muted" : ""}
                                    >
                                        <div className="flex aspect-square size-6 items-center justify-center rounded-sm bg-red-400 text-sidebar-primary-foreground">
                                            <p className="text-sm">{board.title.charAt(0)}</p>
                                        </div>
                                        <span className="truncate">{board.title}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <EllipsisVertical className="ml-auto hover:text-foreground/50 cursor-pointer" size={18} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => handleDeleteBoard(board.id)}>
                                                    <Trash />
                                                    Delete Board
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
            <CreateBoardDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                workspaceId={selectedWorkspaceId!}
            />
        </Sidebar>
    )
}