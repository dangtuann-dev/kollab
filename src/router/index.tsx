import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppLayout } from '../components/layout/AppLayout'

// Các trang component được import trực tiếp hoặc lazy load
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage'

import ProjectsPage from '../features/projects/ProjectsPage'
import SprintBoardPage from '../features/sprint/SprintBoardPage'
import BacklogPage from '../features/backlog/BacklogPage'
import MembersPage from '../features/members/MembersPage'
import ReportsPage from '../features/reports/ReportsPage'

import AuthInitializer from './AuthInitializer'
import ProjectSettingsPage from './ProjectSettingsPage'
import NotFoundPage from './NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AuthInitializer />,
    children: [
      // Các route xác thực (Auth Routes)
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

      // Các route bảo mật (Private Routes)
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
          // Các route dự án lồng nhau bên trong layout chung
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
      
      // Route dự phòng khi không tìm thấy trang (Fallback Route)
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
