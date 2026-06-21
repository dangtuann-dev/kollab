import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Activity, CheckCircle2 } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setIsSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
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
            <h2 className="text-xl font-bold text-neutral-900 font-sans">Check your email</h2>
            <p className="text-sm text-neutral-500 leading-relaxed px-2">
              If an account exists for {email}, we've sent password reset instructions.
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
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-200">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-2">Reset Password</h2>
          <p className="text-sm text-neutral-500">Enter your email and we'll send you a link to reset your password</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <div className="text-center mt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
export default ForgotPasswordPage
