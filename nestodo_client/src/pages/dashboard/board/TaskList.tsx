import { Task } from "@/types/task"
import { TaskList as TaskListType } from "@/types/taskList"
import { AddTask } from "./AddTask"
import { Separator } from "@/components/ui/separator"

interface TaskListProps {
    taskList: TaskListType
}

export default function TaskList({ taskList }: TaskListProps) {
    return (
        <div
            key={taskList.id}
            className="flex flex-col max-h-full w-64 border border-border rounded-lg p-2"
        >
            <h3 className="font-bold mb-4 px-2">{taskList.title}</h3>
            <div className="flex flex-col gap-2 mb-2 flex-[0_1_auto] overflow-y-auto">
                {taskList.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
            <Separator className="my-2" />
            <AddTask taskListId={taskList.id} boardId={taskList.boardId} />
        </div>
    )
}

function TaskCard({ task }: { task: Task }) {
    return (
        <div className="p-3 bg-muted/40 hover:bg-muted/80 border border-border rounded-lg cursor-pointer">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <h3 className="text-sm">{task.title}</h3>
                </div>
            </div>
        </div>
    )
}
