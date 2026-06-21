import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { Spinner } from '../components/ui/Spinner'

export const PrivateRoute: React.FC = () => {
  const { session, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-neutral-500 font-medium font-sans">Checking session...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
export default PrivateRoute
