import MultipleSelector, { Option } from '@/components/ui/multiple-selector'
import { useState } from 'react'
import { tagsApi } from '@/lib/api/tags'
import { Task } from '@/types/task'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { ApiError } from '@/lib/api/base'
import { displayApiError } from '@/lib/utils'
import { toast } from 'sonner'

interface TagsSelectorProps {
  task: Task
  boardId: number
  workspaceId: number
}

function TagsSelector({ task, boardId, workspaceId }: TagsSelectorProps) {
  const initialTags =
    task.tags?.map((tag) => ({
      value: tag.name,
      label: tag.name,
    })) || []

  const [selectedTags, setSelectedTags] = useState<Option[]>(initialTags)
  const queryClient = useQueryClient()

  const updateTagsMutation = useMutation({
    mutationFn: (tagNames: string[]) => tasksApi.updateTask(task.id, { tags: tagNames }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Task tags updated')
    },
    onError: (error: ApiError) => {
      displayApiError('Failed to update task tags', error)
    },
  })

  const handleTagsChange = (options: Option[]) => {
    setSelectedTags(options)
    const tagNames = options.map((option) => option.value)
    updateTagsMutation.mutate(tagNames)
  }

  const searchTags = async (query: string): Promise<Option[]> => {
    try {
      const tags = await tagsApi.searchWorkspaceTags(workspaceId, query)
      return tags.map((tag) => ({
        value: tag,
        label: tag,
      }))
    } catch (error) {
      console.error('Error searching tags:', error)
      return []
    }
  }

  return (
    <MultipleSelector
      value={selectedTags}
      onChange={handleTagsChange}
      onSearch={searchTags}
      placeholder="Add tags..."
      creatable
      triggerSearchOnFocus
      delay={300}
      loadingIndicator={<div className="p-2 text-center">Loading tags...</div>}
      emptyIndicator={<div className="p-2 text-center text-muted-foreground">No tags found</div>}
      className="w-full"
      disabled={updateTagsMutation.isPending}
    />
  )
}

export default TagsSelector
