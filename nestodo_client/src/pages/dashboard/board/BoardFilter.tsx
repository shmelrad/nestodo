import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export type FilterOption = 'all' | 'complete' | 'incomplete'

interface BoardFilterProps {
  filter: FilterOption
  setFilter: (filter: FilterOption) => void
  isFilterActive: boolean
}

export function BoardFilter({ filter, setFilter, isFilterActive }: BoardFilterProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const clearFilters = () => {
    setFilter('all')
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-4 w-4" />
            Filters
            {isFilterActive && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                1
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="end">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">Filter</h3>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium mb-1">Card status</h4>
            <RadioGroup
              value={filter}
              onValueChange={(val: string) => setFilter(val as FilterOption)}
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
        </PopoverContent>
      </Popover>
    </div>
  )
}
