import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

// Bộ khởi tạo để gọi hook useAuth một lần duy nhất khi ứng dụng mount
export const AuthInitializer: React.FC = () => {
  useAuth()
  return <Outlet />
}

export default AuthInitializer
