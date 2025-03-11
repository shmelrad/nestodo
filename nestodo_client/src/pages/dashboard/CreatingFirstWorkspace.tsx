import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/base"
import { workspacesApi } from "@/lib/api/workspaces"
import { displayApiError } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
const createWorkspaceSchema = z.object({
    title: z.string().min(1, "Title is required"),
})

type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>

export default function CreatingFirstWorkspace() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const form = useForm<CreateWorkspaceSchema>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            title: "",
        },
    })

    const createWorkspaceMutation = useMutation({
        mutationFn: (data: CreateWorkspaceSchema) => workspacesApi.createWorkspace(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] })
            form.reset()
            toast.success("Workspace created successfully")
            navigate("/dashboard")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to create workspace", error)
        },
    })

    const onSubmit = (data: CreateWorkspaceSchema) => {
        createWorkspaceMutation.mutate(data)
    }

    return (
        <div className="min-h-screen flex items-center">
            <div className="max-w-lg mx-auto flex flex-col">
                <h1 className="text-2xl font-bold">Create your first workspace</h1>
                <p className="text-sm text-muted-foreground">
                    Start organizing your tasks by creating your first workspace.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="My Workspace" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={createWorkspaceMutation.isPending}
                            >
                                {createWorkspaceMutation.isPending ? "Creating..." : "Create workspace"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}