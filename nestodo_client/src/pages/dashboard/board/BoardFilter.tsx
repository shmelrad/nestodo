import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskPriority } from '@/types/task'

export type FilterOption = 'all' | 'complete' | 'incomplete'

export interface TaskFilters {
  completion: FilterOption
  priorities: (TaskPriority | null)[]
}

interface BoardFilterProps {
  filters: TaskFilters
  setFilters: (filters: TaskFilters) => void
}

export function BoardFilter({ filters, setFilters }: BoardFilterProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const clearFilters = () => {
    setFilters({
      completion: 'all',
      priorities: [],
    })
  }

  const handlePriorityChange = (priority: TaskPriority | null) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority]

    setFilters({
      ...filters,
      priorities: newPriorities,
    })
  }

  const isFilterActive = filters.completion !== 'all' || filters.priorities.length > 0
  const activeFilterCount =
    (filters.completion !== 'all' ? 1 : 0) + (filters.priorities.length > 0 ? 1 : 0)

  return (
    <div className="flex items-center gap-2">
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-4 w-4" />
            Filters
            {isFilterActive && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">Filter</h3>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground select-none">Task status</h4>
              <RadioGroup
                value={filters.completion}
                onValueChange={(val: FilterOption) => setFilters({ ...filters, completion: val })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="all-tasks" value="all" />
                  <Label htmlFor="all-tasks" className="text-sm">
                    All tasks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="marked-complete" value="complete" />
                  <Label htmlFor="marked-complete" className="text-sm">
                    Marked as complete
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="not-marked-complete" value="incomplete" />
                  <Label htmlFor="not-marked-complete" className="text-sm">
                    Not marked as complete
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground select-none">Priority</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priority-none"
                    checked={filters.priorities.includes(null)}
                    onCheckedChange={() => handlePriorityChange(null)}
                  />
                  <Label htmlFor="priority-none" className="text-sm">
                    No priority
                  </Label>
                </div>
                {Object.values(TaskPriority).map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={filters.priorities.includes(priority)}
                      onCheckedChange={() => handlePriorityChange(priority)}
                    />
                    <Label htmlFor={`priority-${priority}`} className="text-sm">
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
