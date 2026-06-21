import React from 'react'

// Component tạm thời cho trang cài đặt dự án (Workspace Settings)
export const ProjectSettingsPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200">
      <h2 className="text-xl font-bold mb-4">Workspace Settings</h2>
      <p className="text-neutral-500 text-sm">Configure project details, integrations, and default sprint duration.</p>
    </div>
  )
}

export default ProjectSettingsPage
