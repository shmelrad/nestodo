import { Task } from "@/types/task"
import { TaskList as TaskListType } from "@/types/taskList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleFadingPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskListProps {
    taskList: TaskListType
}

export default function TaskList({ taskList }: TaskListProps) {
    return (
        <Card className="w-80">
            <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                        {taskList.title}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <CircleFadingPlus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="flex flex-col gap-2">
                    {taskList.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function TaskCard({ task }: { task: Task }) {
    return (
        <Card className="p-3 hover:bg-muted/50 cursor-pointer">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium">{task.title}</h3>
                </div>
                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    {task.priority && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                            {task.priority}
                        </span>
                    )}
                    {task.subtasks.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    )
}
