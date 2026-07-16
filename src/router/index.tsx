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

// Ceremonies imports
import CeremoniesDashboard from '../features/ceremonies/CeremoniesDashboard'
import SprintPlanning from '../features/ceremonies/SprintPlanning'
import DailyStandup from '../features/ceremonies/DailyStandup'
import SprintReview from '../features/ceremonies/SprintReview'
import Retrospective from '../features/ceremonies/Retrospective'

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
            element: <AppLayout />,
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
                  {
                    path: 'ceremonies',
                    children: [
                      {
                        path: '',
                        element: <CeremoniesDashboard />,
                      },
                      {
                        path: 'sprint-planning',
                        element: <SprintPlanning />,
                      },
                      {
                        path: 'daily-standup',
                        element: <DailyStandup />,
                      },
                      {
                        path: 'sprint-review',
                        element: <SprintReview />,
                      },
                      {
                        path: 'retrospective',
                        element: <Retrospective />,
                      },
                    ],
                  },
                ],
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
