"use client"

import { SidebarIcon } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
    workspaceTitle: string
    boardTitle?: string
}

export function DashboardHeader({ workspaceTitle, boardTitle }: DashboardHeaderProps) {
    const { toggleSidebar } = useSidebar()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-sidebar">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    onClick={toggleSidebar}
                >
                    <SidebarIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Breadcrumb className="ml-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">
                                {workspaceTitle}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {boardTitle && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{boardTitle}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}
