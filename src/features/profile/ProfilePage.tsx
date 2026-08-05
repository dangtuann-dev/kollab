import React, { useState, useEffect } from 'react'
import {
  User,
  Lock,
  Bell,
  Shield,
  CheckCircle2,
  Save,
  Camera,
  Key,
  Mail,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../stores/toastStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { capNhatHoSoCaNhan, doiMatKhauTaikhoan } from '../auth/useAuth'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
]

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')

  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [realtimePresence, setRealtimePresence] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }

    setIsUpdatingProfile(true)
    try {
      await capNhatHoSoCaNhan({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      })
      toast.success('Cập nhật thông tin tài khoản thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật hồ sơ cá nhân')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải chứa ít nhất 6 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await doiMatKhauTaikhoan(newPassword)
      toast.success('Đổi mật khẩu tài khoản thành công!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đổi mật khẩu')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleSavePreferences = () => {
    toast.success('Đã lưu tùy chỉnh cá nhân!')
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 font-sans pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative group">
            <Avatar
              src={avatarUrl}
              alt={fullName || user?.email || 'Avatar'}
              fallback={fullName || user?.email || 'U'}
              size="lg"
              className="h-24 w-24 ring-4 ring-white/20 shadow-2xl"
            />
            <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white shadow-md border border-white/30">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight truncate">
                {fullName || 'Thành viên Kollab'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" /> Tài khoản xác thực
              </span>
            </div>
            <p className="text-sm text-neutral-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-4 w-4 text-neutral-400" />
              <span>{user?.email}</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Quản lý thông tin cá nhân, bảo mật tài khoản và các tùy chỉnh hệ thống Kollab.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Hồ sơ cá nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Bảo mật & Mật khẩu</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'preferences'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Tùy chỉnh & Thông báo</span>
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Thông tin cơ bản</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Cập nhật thông tin hiển thị trên các dự án và bảng công việc.</p>
          </div>

          <div className="flex flex-col gap-4 max-w-xl">
            <Input
              label="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ..."
              required
            />

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                <span className="flex-1 font-medium">{user?.email}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Đã xác thực
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                URL Ảnh đại diện (Avatar)
              </label>
              <div className="flex gap-2">
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1"
                />
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2.5 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Hoặc chọn nhanh Avatar mẫu:</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative rounded-full p-0.5 transition-all duration-200 ${
                        avatarUrl === url
                          ? 'ring-2 ring-indigo-600 scale-110 shadow-md'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="h-10 w-10 rounded-full object-cover" />
                      {avatarUrl === url && (
                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button
              type="submit"
              isLoading={isUpdatingProfile}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Lưu thay đổi hồ sơ
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Đổi mật khẩu tài khoản</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Đặt mật khẩu mới an toàn để bảo vệ quyền truy cập Kollab.</p>
          </div>

          <div className="flex flex-col gap-4 max-w-md">
            <Input
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
              required
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
              required
            />

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>Mật khẩu phải dài tối thiểu 6 ký tự. Nên sử dụng kết hợp chữ hoa, chữ thường và chữ số.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button
              type="submit"
              isLoading={isUpdatingPassword}
              leftIcon={<Key className="h-4 w-4" />}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Tùy chỉnh Thông báo & Hệ thống</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Cấu hình cách thức trải nghiệm và nhận thông tin từ Kollab.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Thông báo Email khi được gán Task</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Nhận email khi thành viên gán bạn vào User Story hoặc Task mới.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Trạng thái Hiện diện Trực tuyến (Realtime Presence)</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Hiển thị biểu tượng đang online cho đồng nghiệp biết khi xem Sprint Board.</p>
              </div>
              <input
                type="checkbox"
                checked={realtimePresence}
                onChange={(e) => setRealtimePresence(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Âm thanh Thông báo trong ứng dụng</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Phát âm thanh nhẹ khi có thông báo cập nhật bảng hoặc tin nhắn mới.</p>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button onClick={handleSavePreferences} leftIcon={<Save className="h-4 w-4" />}>
              Lưu cấu hình
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
