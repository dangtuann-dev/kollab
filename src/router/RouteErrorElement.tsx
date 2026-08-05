import React from 'react'
import { useRouteError, useNavigate } from 'react-router-dom'
import { RefreshCw, AlertCircle, Home } from 'lucide-react'
import { Button } from '../components/ui/Button'

export const RouteErrorElement: React.FC = () => {
  const error = useRouteError() as any
  const navigate = useNavigate()

  const handleReload = () => {
    window.location.reload()
  }

  const isChunkError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.name === 'TypeError'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-neutral-100 shadow-xl rounded-2xl p-8 flex flex-col items-center text-center gap-5">
        <div className="h-14 w-14 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center border border-danger-200 shrink-0">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            {isChunkError ? 'Cập nhật phiên bản mới' : 'Đã xảy ra lỗi hệ thống'}
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed px-2">
            {isChunkError
              ? 'Ứng dụng vừa được cập nhật phiên bản mới. Vui lòng làm mới trang để tải các tài nguyên mới nhất.'
              : error?.message || 'Không thể tải trang này. Vui lòng thử làm mới hoặc quay lại trang chủ.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-2">
          <Button
            onClick={handleReload}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-full"
          >
            Tải lại trang
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/projects')}
            leftIcon={<Home className="h-4 w-4" />}
            className="w-full"
          >
            Về Trang chủ
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RouteErrorElement
