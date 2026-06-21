import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppLayout } from '../components/layout/AppLayout'

// Lazy loaded or imported page components
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage'

import ProjectsPage from '../features/projects/ProjectsPage'
import SprintBoardPage from '../features/sprint/SprintBoardPage'
import BacklogPage from '../features/backlog/BacklogPage'
import MembersPage from '../features/members/MembersPage'
import ReportsPage from '../features/reports/ReportsPage'

// Simple placeholder settings & 404 pages
const ProjectSettingsPage = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200">
      <h2 className="text-xl font-bold mb-4">Workspace Settings</h2>
      <p className="text-neutral-500 text-sm">Configure project details, integrations, and default sprint duration.</p>
    </div>
  )
}

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-4xl font-extrabold text-neutral-900 mb-2">404</h1>
    <p className="text-neutral-500 mb-6">Page not found</p>
    <Navigate to="/projects" replace />
  </div>
)

export const router = createBrowserRouter([
  // Auth Routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // Private Routes
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/projects" replace />,
      },
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      // Nested project routes inside layout
      {
        path: '/projects/:projectId',
        element: <AppLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="board" replace />,
          },
          {
            path: 'board',
            element: <SprintBoardPage />,
          },
          {
            path: 'backlog',
            element: <BacklogPage />,
          },
          {
            path: 'members',
            element: <MembersPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'settings',
            element: <ProjectSettingsPage />,
          },
        ],
      },
    ],
  },
  
  // Fallback Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
