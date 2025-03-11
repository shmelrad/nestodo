import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/base"
import { boardsApi } from "@/lib/api/boards"
import { displayApiError } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

type CreateBoardSchema = z.infer<typeof createBoardSchema>

interface CreateBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: number
}

export default function CreateBoardDialog({ open, onOpenChange, workspaceId }: CreateBoardDialogProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<CreateBoardSchema>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: "",
    },
  })

  const createBoardMutation = useMutation({
    mutationFn: (data: CreateBoardSchema) => boardsApi.createBoard(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      onOpenChange(false)
      form.reset()
      toast.success("Board created successfully")
    },
    onError: (error: ApiError) => {
      displayApiError("Failed to create board", error)
    },
  })

  const onSubmit = (data: CreateBoardSchema) => {
    createBoardMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new board</DialogTitle>
          <DialogDescription>
            Add a new board to organize your tasks
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Board" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createBoardMutation.isPending}
              >
                {createBoardMutation.isPending ? "Creating..." : "Create board"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}