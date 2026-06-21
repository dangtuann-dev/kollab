import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const registerSchema = zod.object({
  fullName: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: zod
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: zod.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormInputs = zod.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-neutral-100 shadow-glass rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="h-16 w-16 rounded-full bg-success-50 text-success-600 flex items-center justify-center border border-success-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-neutral-900">Verify your email</h2>
            <p className="text-sm text-neutral-500 leading-relaxed px-2">
              We've sent a verification link to your email address. Please check your inbox (and spam folder) to activate your account.
            </p>
          </div>
          <Link to="/login" className="w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-100 shadow-glass rounded-2xl p-8 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-200">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-2">Create an Account</h2>
          <p className="text-sm text-neutral-500">Get started with AgileFlow team workspace</p>
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
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.fullName?.message}
            required
            leftIcon={<User className="h-4 w-4" />}
            disabled={isLoading}
            {...register('fullName')}
          />

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

          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            required
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            disabled={isLoading}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Register
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-500 border-t border-neutral-100 pt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage
