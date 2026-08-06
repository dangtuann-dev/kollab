import React, { useState, useEffect } from 'react'
import { Plus, Search, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useDeleteProject } from '../../hooks/useProjects'
import { useAuthStore, useOnboardingStore } from '../../stores'
import { ProjectCard } from './ProjectCard'
import { ProjectFormModal } from './ProjectFormModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LogoIcon } from '../../components/ui/Logo'
import { EmptyState } from '../../components/shared/EmptyState'
import { SkeletonGrid } from '../../components/shared/LoadingSkeleton'
import { supabase } from '../../lib/supabase'
import { WelcomeOnboardingModal } from '../../components/onboarding/WelcomeOnboardingModal'
import { OnboardingTooltip } from '../../components/shared/OnboardingTooltip'

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, isLoading } = useProjects()
  const { deleteProject } = useDeleteProject()
  const { hasSeenWelcomeModal, openWelcomeModal } = useOnboardingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(undefined)

  useEffect(() => {
    if (!hasSeenWelcomeModal && !isLoading) {
      openWelcomeModal()
    }
  }, [hasSeenWelcomeModal, isLoading, openWelcomeModal])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProject(undefined)
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 font-sans">
        
        <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0">
              <LogoIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Không gian làm việc Kollab</h1>
              <p className="text-xs text-neutral-500">Đã đăng nhập bằng {user?.email}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut className="h-4 w-4" />}>
            Đăng xuất
          </Button>
        </div>

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

          <OnboardingTooltip
            storageKey="create_project_btn"
            title="Tạo dự án mới"
            content="Nhấn vào đây để khởi tạo dự án Agile mới và bắt đầu quản lý nhóm làm việc."
            position="bottom"
          >
            <Button
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="h-4.5 w-4.5" />}
              className="shadow-sm w-full"
            >
              Dự án mới
            </Button>
          </OnboardingTooltip>
        </div>

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
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}

      <ProjectFormModal isOpen={isModalOpen} onClose={handleCloseModal} project={editingProject} />
      <WelcomeOnboardingModal />
    </div>
  )
}
export default ProjectsPage

