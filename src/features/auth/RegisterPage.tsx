import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const registerSchema = zod.object({
  fullName: zod.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: zod.string().min(1, 'Email là bắt buộc').email('Vui lòng nhập địa chỉ email hợp lệ'),
  password: zod
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số'),
  confirmPassword: zod.string().min(1, 'Vui lòng xác nhận mật khẩu của bạn'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type RegisterFormInputs = zod.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
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
      const { data: resData, error } = await supabase.auth.signUp({
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

      if (resData?.session) {
        // Nếu Confirm email tắt, Supabase trả về session ngay lập tức, chuyển hướng vào trang chủ
        navigate('/projects', { replace: true })
      } else {
        // Nếu vẫn yêu cầu Confirm email, hiện màn hình thông báo kiểm tra hòm thư
        setIsSuccess(true)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.')
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
            <h2 className="text-xl font-bold text-neutral-900">Xác thực email của bạn</h2>
            <p className="text-sm text-neutral-500 leading-relaxed px-2">
              Chúng tôi đã gửi liên kết xác thực đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến (và thư mục spam) để kích hoạt tài khoản.
            </p>
          </div>
          <Link to="/login" className="w-full">
            <Button className="w-full">Quay lại Đăng nhập</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-100 shadow-glass rounded-2xl p-8 flex flex-col gap-6">
        
        {/* Tiêu đề thương hiệu */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-200">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-2">Tạo tài khoản</h2>
          <p className="text-sm text-neutral-500">Bắt đầu với không gian làm việc của nhóm AgileFlow</p>
        </div>

        {/* Thông báo lỗi chung */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-danger-50 border border-danger-200 rounded-lg text-xs text-danger-700 font-medium">
            <AlertCircle className="h-4.5 w-4.5 text-danger-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Biểu mẫu đăng ký */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Họ và Tên"
            type="text"
            placeholder="John Doe"
            error={errors.fullName?.message}
            required
            leftIcon={<User className="h-4 w-4" />}
            disabled={isLoading}
            {...register('fullName')}
          />

          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={isLoading}
            {...register('email')}
          />

          <Input
            label="Mật khẩu"
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
            label="Xác nhận mật khẩu"
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
            Đăng ký
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-500 border-t border-neutral-100 pt-4">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage
