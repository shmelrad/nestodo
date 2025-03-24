import { Task } from '@/types/task'
import TagsSelector from './TagsSelector'
import TimeEstimation from './TimeEstimation'
import TaskPrioritySelect from './TaskPrioritySelect'

export default function TaskOptions({
  task,
  boardId,
  workspaceId,
}: {
  task: Task
  boardId: number
  workspaceId: number
}) {
  const elements = [
    {
      label: 'Priority',
      element: <TaskPrioritySelect task={task} boardId={boardId} />,
    },
    {
      label: 'Time estimation',
      element: <TimeEstimation task={task} boardId={boardId} />,
    },
    {
      label: 'Tags',
      element: <TagsSelector task={task} boardId={boardId} workspaceId={workspaceId} />,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-6">
        {elements.map((element, index) => (
          <div className="contents" key={index}>
            <p className="text-sm font-semibold w-max self-center text-muted-foreground">
              {element.label}
            </p>
            {element.element}
          </div>
        ))}
      </div>
    </>
  )
}
