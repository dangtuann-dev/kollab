import React, { useState } from 'react'
import { Plus, Search, FolderKanban, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { ProjectCard } from './ProjectCard'
import { CreateProjectModal } from './CreateProjectModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/shared/EmptyState'
import { SkeletonGrid } from '../../components/shared/LoadingSkeleton'
import { supabase } from '../../lib/supabase'

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <FolderKanban className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Không gian làm việc AgileFlow</h1>
              <p className="text-xs text-neutral-500">Đã đăng nhập bằng {user?.email}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut className="h-4 w-4" />}>
            Đăng xuất
          </Button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4.5 w-4.5 text-neutral-400" />}
              className="py-1.5"
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            className="shadow-sm"
          >
            Dự án mới
          </Button>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'Không tìm thấy dự án phù hợp' : 'Chưa có dự án nào'}
            description={
              searchQuery
                ? `Không thể tìm thấy bất kỳ dự án nào khớp với "${searchQuery}". Hãy thử điều chỉnh từ khóa.`
                : "Bắt đầu bằng cách tạo không gian làm việc dự án agile đầu tiên của bạn. Bạn sẽ có thể mời các lập trình viên và quản lý sprint."
            }
            action={
              !searchQuery && (
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4.5 w-4.5" />}>
                  Tạo dự án đầu tiên
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
export default ProjectsPage
