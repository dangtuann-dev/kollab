import React from 'react'
import { Navigate } from 'react-router-dom'

export const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-4xl font-extrabold text-neutral-900 mb-2">404</h1>
    <p className="text-neutral-500 mb-6">Trang không tìm thấy</p>
    <Navigate to="/projects" replace />
  </div>
)

export default NotFoundPage
