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
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, DefaultValues, FieldValues, Path } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { ApiError } from "@/lib/api/base"
import { displayApiError } from "@/lib/utils"

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder: string
  type?: string
}

export interface FormDialogProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  schema: z.ZodType<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => Promise<unknown>
  onSuccess?: () => void
  invalidateQueryKeys?: unknown[][]
  submitButtonText: string
  pendingButtonText: string
  successMessage: string
  errorMessage: string
  fields: FormFieldConfig<T>[]
}

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  invalidateQueryKeys = [],
  submitButtonText,
  pendingButtonText,
  successMessage,
  errorMessage,
  fields,
}: FormDialogProps<T>) {
  const queryClient = useQueryClient()
  
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      invalidateQueryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
      onOpenChange(false)
      form.reset()
      if (onSuccess) onSuccess()
      toast.success(successMessage)
    },
    onError: (error: ApiError) => {
      displayApiError(errorMessage, error)
    },
  })

  const handleSubmit = (data: T) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form<T> {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fields.map((field) => (
              <FormField
                key={field.name.toString()}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input 
                        type={field.type || "text"}
                        placeholder={field.placeholder} 
                        {...formField} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? pendingButtonText : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 