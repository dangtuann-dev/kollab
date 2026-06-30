import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export const AuthInitializer: React.FC = () => {
  useAuth()
  return <Outlet />
}

export default AuthInitializer
