import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import Layout from './Layout'
import CarsPage from '../pages/CarsPage'
import JournalPage from '../pages/JournalPage'
import LoginPage from '../pages/LoginPage'
import NewEntryPage from '../pages/NewEntryPage'
import StatsPage from '../pages/StatsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUserId = useAuthStore((state) => state.currentUserId)
  const location = useLocation()

  if (!currentUserId) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

function RedirectIfAuthed() {
  const currentUserId = useAuthStore((state) => state.currentUserId)

  if (currentUserId) return <Navigate to="/" replace />

  return <LoginPage />
}

const router = createBrowserRouter([
  { path: '/login', element: <RedirectIfAuthed /> },
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <CarsPage /> },
      { path: '/journal', element: <JournalPage /> },
      { path: '/stats', element: <StatsPage /> },
      { path: '/new', element: <NewEntryPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
