import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi, LoginResponse } from '@/lib/api/auth'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useMutation } from '@tanstack/react-query'
import { displayApiError } from '@/lib/utils'
import { FormFieldInput } from '@/components/ui/form-field-input'
import { ApiError } from '@/lib/api/base'

const formFields = [
  {
    name: 'username' as const,
    label: 'Username',
    type: 'text',
    placeholder: 'johndoe',
  },
  {
    name: 'password' as const,
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
]

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginSchema) => authApi.login(data),
    onSuccess: ({ accessToken }: LoginResponse) => {
      login(accessToken)
      navigate('/')
      toast.success('Logged in successfully')
    },
    onError: (error: ApiError) => {
      displayApiError('Login failed', error)
    },
  })

  const onSubmit = (data: LoginSchema) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back!</CardTitle>
          <CardDescription>Sign in to your nestodo account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {formFields.map((field) => (
                <FormFieldInput
                  key={field.name}
                  form={form}
                  disabled={loginMutation.isPending}
                  {...field}
                />
              ))}
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
