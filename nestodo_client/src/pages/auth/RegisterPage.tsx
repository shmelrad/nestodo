import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { authApi, LoginResponse } from "@/lib/api/auth"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { useMutation } from "@tanstack/react-query"
import { displayApiError } from "@/lib/utils"
import { FormFieldInput } from "@/components/ui/form-field-input"
import { ApiError } from "@/lib/api/base"

const formFields = [
    {
        name: "email" as const,
        label: "Email",
        type: "email",
        placeholder: "john@doe.com"
    },
    {
        name: "username" as const,
        label: "Username",
        type: "text",
        placeholder: "johndoe"
    },
    {
        name: "password" as const,
        label: "Password",
        type: "password",
        placeholder: "Choose a password"
    },
    {
        name: "confirmPassword" as const,
        label: "Confirm Password",
        type: "password",
        placeholder: "Confirm your password"
    }
]

const registerSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    username: z.string()
        .min(1, "Username is required"),
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
        .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegisterSchema = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    const form = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
        },
    })

    const registerMutation = useMutation({
        mutationFn: (data: RegisterSchema) => {
            const dto = {
                email: data.email,
                username: data.username,
                password: data.password,
            }
            return authApi.register(dto)
        },
        onSuccess: (data: LoginResponse) => {
            login(data.access_token)
            navigate("/")
            toast.success("Registered successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Registration failed", error)
        },
    })

    const onSubmit = (data: RegisterSchema) => {
        registerMutation.mutate(data)
    }

    return (
        <div className="container max-w-sm mx-auto py-10">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <CardDescription>Join nestodo and start managing your tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {formFields.map(field => (
                                <FormFieldInput
                                    key={field.name}
                                    form={form}
                                    disabled={registerMutation.isPending}
                                    {...field}
                                />
                            ))}
                            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                                {registerMutation.isPending ? "Registering..." : "Register"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}