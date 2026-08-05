import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { PageSkeleton } from '../components/shared/LoadingSkeleton'
import AuthInitializer from './AuthInitializer'
import { RouteErrorElement } from './RouteErrorElement'

function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenReloaded = JSON.parse(
      sessionStorage.getItem('page_reloaded_for_chunk_error') || 'false'
    )

    try {
      const component = await componentImport()
      sessionStorage.setItem('page_reloaded_for_chunk_error', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        sessionStorage.setItem('page_reloaded_for_chunk_error', 'true')
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }
  })
}

const LoginPage = lazyWithRetry(() => import('../features/auth/LoginPage'))
const RegisterPage = lazyWithRetry(() => import('../features/auth/RegisterPage'))
const ForgotPasswordPage = lazyWithRetry(() => import('../features/auth/ForgotPasswordPage'))

const ProjectsPage = lazyWithRetry(() => import('../features/projects/ProjectsPage'))
const DashboardPage = lazyWithRetry(() => import('../features/dashboard/DashboardPage'))
const SprintBoardPage = lazyWithRetry(() => import('../features/sprint/SprintBoardPage'))
const BacklogPage = lazyWithRetry(() => import('../features/backlog/BacklogPage'))
const MembersPage = lazyWithRetry(() => import('../features/members/MembersPage'))
const ReportsPage = lazyWithRetry(() => import('../features/reports/ReportsPage'))

const ProjectSettingsPage = lazyWithRetry(() => import('./ProjectSettingsPage'))
const ProfilePage = lazyWithRetry(() => import('../features/profile/ProfilePage'))
const NotFoundPage = lazyWithRetry(() => import('./NotFoundPage'))

const CeremoniesDashboard = lazyWithRetry(() => import('../features/ceremonies/CeremoniesDashboard'))
const SprintPlanning = lazyWithRetry(() => import('../features/ceremonies/SprintPlanning'))
const DailyStandup = lazyWithRetry(() => import('../features/ceremonies/DailyStandup'))
const SprintReview = lazyWithRetry(() => import('../features/ceremonies/SprintReview'))
const Retrospective = lazyWithRetry(() => import('../features/ceremonies/Retrospective'))

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <AuthInitializer />,
    errorElement: <RouteErrorElement />,
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
                path: '/profile',
                element: (
                  <SuspenseWrapper>
                    <ProfilePage />
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
