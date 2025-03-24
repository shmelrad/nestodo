import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CircleFadingPlus } from 'lucide-react'
import { taskListsApi } from '@/lib/api/taskLists'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/base'
import { displayApiError } from '@/lib/utils'
import { toast } from 'sonner'

interface AddTaskListProps {
  boardId: number
}

export function AddTaskList({ boardId }: AddTaskListProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const createTaskListMutation = useMutation({
    mutationFn: (title: string) => taskListsApi.createTaskList({ title, boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setTitle('')
      setIsEditing(false)
      toast.success('Task list created successfully')
    },
    onError: (error: ApiError) => {
      displayApiError('Failed to create task list', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      createTaskListMutation.mutate(title)
    } else {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex-shrink-0 w-64">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="bg-muted/50"
          onBlur={() => setIsEditing(false)}
          disabled={createTaskListMutation.isPending}
        />
      </form>
    )
  }

  return (
    <Button
      variant="ghost"
      className="flex-shrink-0 w-64 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors justify-start"
      onClick={() => setIsEditing(true)}
    >
      <CircleFadingPlus className="h-5 w-5 mr-2" />
      Add new task list
    </Button>
  )
}
