import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { PageSkeleton } from '../components/shared/LoadingSkeleton'
import AuthInitializer from './AuthInitializer'

const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'))

const ProjectsPage = lazy(() => import('../features/projects/ProjectsPage'))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const SprintBoardPage = lazy(() => import('../features/sprint/SprintBoardPage'))
const BacklogPage = lazy(() => import('../features/backlog/BacklogPage'))
const MembersPage = lazy(() => import('../features/members/MembersPage'))
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'))

const ProjectSettingsPage = lazy(() => import('./ProjectSettingsPage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))

const CeremoniesDashboard = lazy(() => import('../features/ceremonies/CeremoniesDashboard'))
const SprintPlanning = lazy(() => import('../features/ceremonies/SprintPlanning'))
const DailyStandup = lazy(() => import('../features/ceremonies/DailyStandup'))
const SprintReview = lazy(() => import('../features/ceremonies/SprintReview'))
const Retrospective = lazy(() => import('../features/ceremonies/Retrospective'))

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <AuthInitializer />,
    children: [
      {
        path: '/login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/register',
        element: (
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        ),
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
                element: (
                  <SuspenseWrapper>
                    <DashboardPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/projects',
                element: (
                  <SuspenseWrapper>
                    <ProjectsPage />
                  </SuspenseWrapper>
                ),
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
                    element: (
                      <SuspenseWrapper>
                        <SprintBoardPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'backlog',
                    element: (
                      <SuspenseWrapper>
                        <BacklogPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'members',
                    element: (
                      <SuspenseWrapper>
                        <MembersPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'reports',
                    element: (
                      <SuspenseWrapper>
                        <ReportsPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'settings',
                    element: (
                      <SuspenseWrapper>
                        <ProjectSettingsPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'ceremonies',
                    children: [
                      {
                        path: '',
                        element: (
                          <SuspenseWrapper>
                            <CeremoniesDashboard />
                          </SuspenseWrapper>
                        ),
                      },
                      {
                        path: 'sprint-planning',
                        element: (
                          <SuspenseWrapper>
                            <SprintPlanning />
                          </SuspenseWrapper>
                        ),
                      },
                      {
                        path: 'daily-standup',
                        element: (
                          <SuspenseWrapper>
                            <DailyStandup />
                          </SuspenseWrapper>
                        ),
                      },
                      {
                        path: 'sprint-review',
                        element: (
                          <SuspenseWrapper>
                            <SprintReview />
                          </SuspenseWrapper>
                        ),
                      },
                      {
                        path: 'retrospective',
                        element: (
                          <SuspenseWrapper>
                            <Retrospective />
                          </SuspenseWrapper>
                        ),
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
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
])

export default router
