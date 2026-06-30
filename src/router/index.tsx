import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppLayout } from '../components/layout/AppLayout'

import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage'

import ProjectsPage from '../features/projects/ProjectsPage'
import DashboardPage from '../features/dashboard/DashboardPage'
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

      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/projects',
            element: <ProjectsPage />,
          },
          
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

      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
