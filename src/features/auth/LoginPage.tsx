import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Activity, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../stores/toastStore'

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormInputs = zod.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  // Get the redirect target path
  const from = (location.state as any)?.from?.pathname || '/projects'

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      toast.success('Signed in successfully!')
      navigate(from, { replace: true })
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-100 shadow-glass rounded-2xl p-8 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-200">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-2">Welcome to AgileFlow</h2>
          <p className="text-sm text-neutral-500">Sign in to manage your Agile/Scrum sprints</p>
        </div>

        {/* Global Error message */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-danger-50 border border-danger-200 rounded-lg text-xs text-danger-700 font-medium">
            <AlertCircle className="h-4.5 w-4.5 text-danger-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={isLoading}
            {...register('email')}
          />

          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              required
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              disabled={isLoading}
              {...register('password')}
            />
            <div className="flex justify-end mt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 focus:outline-none"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-500 border-t border-neutral-100 pt-4">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
