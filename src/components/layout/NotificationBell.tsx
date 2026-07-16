import React, { useState } from 'react'
import { Bell, CheckCheck, Inbox, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-neutral-500 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-100 transition-all focus:outline-none"
        title="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

          {/* Dropdown Card */}
          <div className="absolute right-0 mt-2.5 w-80 bg-white border border-neutral-200/80 rounded-2xl shadow-xl z-30 overflow-hidden animate-slide-up origin-top-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50 border-b border-neutral-150">
              <span className="text-xs font-bold text-neutral-850">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-850 flex items-center gap-1 transition-all"
                >
                  <CheckCheck className="h-3 w-3" />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                  <Inbox className="h-6 w-6 text-neutral-300" />
                  <p className="text-[11px] font-semibold text-neutral-400">Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.read_at
                  return (
                    <div
                      key={notif.id}
                      onClick={() => isUnread && handleMarkRead(notif.id)}
                      className={`p-3.5 flex flex-col gap-1 transition-all cursor-pointer ${
                        isUnread ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[11px] font-bold ${isUnread ? 'text-neutral-850' : 'text-neutral-500'}`}>
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-555 shrink-0 mt-1" />
                        )}
                      </div>
                      
                      {notif.body && (
                        <p className="text-[10px] text-neutral-500 leading-normal">
                          {notif.body}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-1 text-[9px] text-neutral-400">
                        <span>{new Date(notif.created_at).toLocaleDateString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        
                        {notif.link && (
                          <Link
                            to={notif.link}
                            onClick={() => setIsOpen(false)}
                            className="text-primary-600 hover:underline flex items-center gap-0.5"
                          >
                            Chi tiết
                            <ExternalLink className="h-2 w-2" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
