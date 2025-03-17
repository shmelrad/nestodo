import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task }: { task: Task }) {
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

    return (
        <div className={`p-3 bg-muted/40 hover:bg-muted/80 border border-border rounded-lg cursor-pointer ${isDragging ? "opacity-30" : ""}`}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <h3 className={`text-sm ${isDragging ? "invisible" : ""}`}>{task.title}</h3>
                </div>
            </div>
        </div>
    )
}