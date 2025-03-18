import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import TaskDialog from "@/pages/dashboard/dialogs/TaskDialog";

interface TaskCardProps {
    task: Task
    boardId: number
}

export default function TaskCard({ task, boardId }: TaskCardProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const { attributes, listeners, setNodeRef, transition, transform, isDragging } = useSortable(
        {
            id: `${task.id}`,
            data: {
                type: 'task',
                task
            }
        }
    )

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const handleTaskClick = (e: React.MouseEvent) => {
        if (!isDragging) {
            e.stopPropagation();
            setEditDialogOpen(true);
        }
    }

    return (
        <>
            <div 
                className={`p-3 bg-muted/40 hover:bg-muted/80 border border-border rounded-lg cursor-pointer ${isDragging ? "opacity-30" : ""}`}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={handleTaskClick}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                        <h3 className={`text-sm whitespace-pre-wrap [overflow-wrap:anywhere] ${isDragging ? "invisible" : ""}`}>{task.title}</h3>
                    </div>
                </div>
            </div>

            <TaskDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                task={task}
                boardId={boardId}
            />
        </>
    )
}